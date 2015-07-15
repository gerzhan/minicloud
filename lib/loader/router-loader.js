/**
 * Module dependencies.
 */
var Resource = require('koa-resource-router')
var debug = require('debug')('api')
var path = require('path')
var fs = require('fs')
var join = path.resolve
var readdir = fs.readdirSync
var pageValidation = require("../middleware/page-validation-middleware")
    /**
     * Load resources in `root` directory. * 
     *
     * @param {Object} oauth
     * @param {Object} router
     * @param {String} root
     * @api public
     */
module.exports = function(oauth, router, root) { 
    readdir(root).forEach(function(file) {
        var dir = join(root, file)
        var stats = fs.lstatSync(dir)
        if (stats.isDirectory()) {
            var conf = require(dir + '/config.json')
            conf.name = file
            conf.directory = dir
            if (conf.routes) route(oauth, router, conf);
            else resource(router, conf)
        }
    });
};

/**
 * Define routes in `conf`.
 * @param {Object} oauth
 * @param {Object} router
 * @param {String} conf
 * @api private
 */

function route(oauth, router, conf) {
    //把Post转换为json到this.request.body
    var bodyParser = require('koa-bodyparser')

    var mod = require(conf.directory)

    for (var key in conf.routes) {
        var prop = conf.routes[key];
        //var method = key.split(' ')[0];
        var path = key.split(' ')[0];
        //debug('%s %s -> .%s', method, path, prop);

        var fn = mod[prop];
        if (!fn) throw new Error(conf.name + ': exports.' + prop + ' is not defined');
        //validate access_token
        if (typeof(conf.valid_access_token) != "undefined" && conf.valid_access_token) {
            router.use(path, oauth.authorise())
        }
        //validate cookie,for minicloud 3.0,No relationship with API
        if (typeof(conf.valid_cookie) != "undefined" && conf.valid_cookie) {
            router.use(path, pageValidation())
        }
        router.use(path, bodyParser())
        router.get(path, fn)
        router.post(path, fn)
    }
}

/**
 * Define resource in `conf`.
 * @param {Object} app
 * @param {Object} conf 
 * @api private
 */

function resource(app, conf) {
    if (!conf.name) throw new Error('.name in ' + conf.directory + '/config.json is required')
    debug('resource: %s', conf.name)

    var mod = require(conf.directory)
    app.use(Resource(conf.name, mod).middleware())
}
