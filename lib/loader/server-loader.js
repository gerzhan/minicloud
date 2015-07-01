/**
 * service.minicloud.io站点初始化
 */
var responseTime = require('koa-response-time')
var ratelimit = require('koa-ratelimit')
var compress = require('koa-compress')
var logger = require('koa-logger')
var router = require('koa-router')()
var load = require('./router-loader')
var koa = require('koa')
var cors = require('kcors')
var $proxy = require('koa-http-proxy')
var defautPageMiddleware = require("../middleware/default-page-middleware")
var errorPageMiddleware = require("../middleware/error-page-middleware")
  //通过get/post/header的token初始化用户
var oauthserver = require('koa-oauth-server')
var model = require('../router/api/oauth2/model')
var oauth = oauthserver({
  model: model,
  grants: ['password'],
  debug: false
});

/**
 * Environment.
 */
var env = process.env.NODE_ENV || 'development'
  /**
   * Expose `api()`.
   */
module.exports = function(app, opts) {
  opts = opts || {}
  var app = koa()

  //把Post转换为json到this.request.body
  var bodyParser = require('koa-bodyparser')
  app.use(cors())
  app.use(bodyParser())
  app.use(defautPageMiddleware())
  app.use(errorPageMiddleware())
    // logging
  if ('test' != env) app.use(logger())
    // x-response-time
  app.use(responseTime())
    // compression
  app.use(compress())
    // routing 
  app.use(router.routes())
    .use(router.allowedMethods())
    //加载API模块的路由规则
  load(oauth, router, __dirname + '/../router/api')
    //加载Web页面的路由规则
  load(oauth, router, __dirname + '/../router/web')
    //oauth根据model的定义，反向获得用户在this.request.user
  app.use(oauth.authorise())
  app.use($proxy('http://127.0.0.1:7070'))
  return app;
}