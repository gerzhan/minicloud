/**
 * Module dependencies.
 */
var responseTime = require('koa-response-time')
var compress = require('koa-compress');
var logger = require('koa-logger');
var koa = require('koa')
var staticServer = require('koa-static')
var cors = require('kcors')
  /**
   * Environment.
   */
var env = process.env.NODE_ENV || 'development';

/**
 * Expose `api()`.
 */

module.exports = function(app, opts) {
  opts = opts || {};
  var app = koa();
  // logging
  if ('test' != env) app.use(logger());
  // x-response-time
  app.use(responseTime());
  // compression
  app.use(compress());
  app.use(cors())
  app.use(staticServer('/usr/local/miniyun/static.minicloud.io'))

  return app;
}