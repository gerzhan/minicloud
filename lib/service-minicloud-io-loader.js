/**
 * Module dependencies.
 */

var responseTime = require('koa-response-time')
var ratelimit = require('koa-ratelimit')
var compress = require('koa-compress')
var logger = require('koa-logger')
var router = require('koa-router')()
var load = require('./lib/load')
var koa = require('koa')
var $proxy = require('koa-http-proxy')
var session = require('koa-session')

//通过get/post/header的access_token初始化用户
var oauthserver = require('koa-oauth-server')
var model = require('../api/oauth2/model')
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
  app.use(session(app))
    //oauth根据model的定义，反向获得用户在this.request.user
    //app.use(oauth.authorise())
    //把Post转换为json到this.request.body
  var bodyParser = require('koa-bodyparser')
  app.use(bodyParser())
    // logging
  if ('test' != env) app.use(logger())
    // x-response-time
  app.use(responseTime())
    // compression
  app.use(compress())
    // routing 
  app.use(router.routes())
    .use(router.allowedMethods())
    //加载业务模块
  load(oauth, router, __dirname + '/../api')
  app.use($proxy('http://127.0.0.1:7070'))
  return app;
}