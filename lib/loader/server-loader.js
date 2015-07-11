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
//通过get/post/header的token初始化用户
var oauthserver = require('koa-oauth-server')
var model = require('../router/api/oauth2/model')
var oauth = oauthserver({
  model: model,
  grants: ['password'],
  debug: false
});
//页面中间件
var defautPageMiddleware = require("../middleware/default-page-middleware")
var errorPageMiddleware = require("../middleware/error-page-middleware")
var contextMiddleware = require("../middleware/context-middleware")
/**
 * Environment.
 */
var env = process.env.NODE_ENV || 'development'

module.exports = function(opts) {
  var app = koa()
 
  app.use(contextMiddleware())
  app.use(cors())
  //3.0 include page 
  if(opts.version>2.2){
    app.use(defautPageMiddleware())
    app.use(errorPageMiddleware())
  }
  
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
  //2.2 proxy to php
  if(opts.version==2.2){
    app.use($proxy('http://127.0.0.1:7070'))
  }
  return app;
}