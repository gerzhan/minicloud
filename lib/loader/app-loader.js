/**
 * Module dependencies.
 */
var responseTime = require('koa-response-time')
var ratelimit = require('koa-ratelimit')
var compress = require('koa-compress')
var logger = require('koa-logger')
var router = require('koa-router')()
var koa = require('koa')
var env = process.env.NODE_ENV || 'development'
    
    /**
     * Return koa app.
     *
     * load all middleware and all routers
     * @param {Object} opts
     * @return {Object}
     * @api public
     */
module.exports = function*(opts) {
    var app = koa() 
        //init db connect
    global.dbPool = yield require("./db-loader")(opts)
        //init appContext
    global.appContext = opts
        //init
    global.redisClient = require('koa-redis')(opts.redis)
        //support cros
    var cors = require('kcors')
    app.use(cors())
        //minicloud middlewares    
    var contextMiddleware = require("../middleware/context-middleware")
    app.use(contextMiddleware())
        //3.0 include page 
    if (opts.version > 2.2) {
        var defautPageMiddleware = require("../middleware/default-page-middleware")
        var notFoundPageMiddleware = require("../middleware/not-found-page-middleware")
        app.use(defautPageMiddleware())
        app.use(notFoundPageMiddleware())
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
    console.log(000)
        //load router
    var apiLoader = require('./router-loader')
    console.log(111)
    var oauthModel = require('../router/api/oauth2/model')
    console.log(222)
    var oauthServer = require('koa-oauth-server')
    var oauth = oauthServer({
        model: oauthModel,
        grants: ['password'],
        debug: false
    })
    apiLoader(oauth, router, __dirname + '/../router/api')
    apiLoader(oauth, router, __dirname + '/../router/web')
        //v2.2 proxy to php
    if (opts.version == 2.2) {
        var $proxy = require('koa-http-proxy')
        app.use($proxy('http://127.0.0.1:7070'))
    }
    return app
}
