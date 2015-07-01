
/**
 * Module dependencies.
 */

var Resource = require('koa-resource-router');
var debug = require('debug')('api');
var path = require('path');
var fs = require('fs');
var join = path.resolve;
var readdir = fs.readdirSync;
var pageValidation = require("../middleware/page-validation-middleware")
/**
 * Load resources in `root` directory.
 *
 * TODO: move api.json (change name?)
 * bootstrapping into an npm module.
 *
 * TODO: adding .resources to config is lame,
 * but assuming no routes is also lame, change
 * me
 *
 * @param {Application} app
 * @param {String} root
 * @api private
 */
module.exports = function(oauth,router, root){ 
  //读取api目录下的路由配置信息
  readdir(root).forEach(function(file){
    var dir = join(root, file);
    var stats = fs.lstatSync(dir);
    if (stats.isDirectory()) {
      var conf = require(dir + '/config.json');
      conf.name = file;
      conf.directory = dir;
      if (conf.routes) route(oauth,router,conf);
      else resource(router, conf);
    }
  });
};

/**
 * Define routes in `conf`.
 */

function route(oauth,router, conf) {
  debug('routes: %s', conf.name);

  var mod = require(conf.directory);

  for (var key in conf.routes) {
    var prop = conf.routes[key];
    //var method = key.split(' ')[0];
    var path = key.split(' ')[0];
    //debug('%s %s -> .%s', method, path, prop);

    var fn = mod[prop];
    if (!fn) throw new Error(conf.name + ': exports.' + prop + ' is not defined');
    //根据配置文件判断是否需要access_token验证，这多用于API接口
    if(typeof(conf.valid_access_token)!="undefined" && conf.valid_access_token){
      router.use(path,oauth.authorise())
    } 
    //根据配置文件判断是否需要cookie验证，这多用于Web页面访问
    if(typeof(conf.valid_cookie)!="undefined" && conf.valid_cookie){
      router.use(path,pageValidation())
    }      
    router.get(path, fn);
    router.post(path, fn);
  }
}

/**
 * Define resource in `conf`.
 */

function resource(app, conf) {
  if (!conf.name) throw new Error('.name in ' + conf.directory + '/config.json is required');
  debug('resource: %s', conf.name);

  var mod = require(conf.directory);
  app.use(Resource(conf.name, mod).middleware());
}