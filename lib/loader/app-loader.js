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
        //compatible with the mini version of 3.0
    global.oldVersion = opts.version < 3
    global.testModel = env == 'test'
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
    var contextMiddleware = require('../middleware/context-middleware')
    app.use(contextMiddleware())   
    // logging
    app.use(logger())
        // x-response-time
    app.use(responseTime())
        // compression
    app.use(compress())
        // routing 
    app.use(router.routes())
        .use(router.allowedMethods())

    //load router
    var apiLoader = require('./router-loader')
    var oauthModel = require('../router/api/oauth2/model')
    var oauthServer = require('koa-oauth-server')
    var oauth = oauthServer({
        model: oauthModel,
        grants: ['password'],
        debug: false
    })

    apiLoader(oauth, router, __dirname + '/../router/api')
    
    return app
}
