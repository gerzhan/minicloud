/**
 * Module dependencies.
 */
var responseTime = require('koa-response-time')
var ratelimit = require('koa-ratelimit')
var compress = require('koa-compress')
var logger = require('koa-logger')
var router = require('koa-router')()
var koa = require('minicloud-koa.io')
var env = process.env.NODE_ENV || 'development'
var fs = require('fs')
var fsPlus = require('co-fs-plus')
    /**
     * Return init app config.
     * 
     * @param {Object} opts
     * @return {Object}
     * @api private
     */
var initConfig = function*(opts) {
        //set default config
        opts = opts || {}
        opts.port = opts.port || 8030
        opts.logs = opts.logs || './logs'
        opts.safe_code = opts.safe_code || 'uBEEAcKM2D7sxpJD7QQEapsxiCmzPCyS'
        opts.single_file_max_size = opts.single_file_max_size || 1024
        opts.cache = opts.cache || './cache'
        opts.path = opts.path || ['./data/a', './data/b', './data/c']
            //create data folder
        var paths = opts.path
        for (var i = 0; i < paths.length; i++) {
            var subPath = paths[i]
            if (!fs.existsSync(subPath)) {
                yield fsPlus.mkdirp(subPath)
            }
        }
        //create cache folder
        if (!fs.existsSync(opts.cache)) {
            yield fsPlus.mkdirp(opts.cache)
        }
        return opts
    }
    /**
     * Return koa app.
     *
     * load all middleware and all routers
     * @param {Object} opts
     * @return {Object}
     * @api public
     */
module.exports = function*(opts, app) {
    opts = yield initConfig(opts)
    var app = app || koa()
    global.testModel = env == 'test'
    global.PATH_SEP = '/'
    global.SUPER_ADMIN = 9
    global.SUB_ADMIN = 3
    global.COMMON_USER = 1
        //init db connect 
    global.sequelizePool = yield require("./sequelize-loader")(opts)
        //init appContext
    global.appContext = opts 

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
    var oauthServer = require('minicloud-koa-oauth-server')
    var oauth = oauthServer({
        model: oauthModel,
        grants: ['password'],
        debug: false
    })
    var webDefautMiddleware = require('../middleware/web-default-middleware')
    var webNotFoundMiddleware = require('../middleware/web-not-found-middleware')
    app.use(webDefautMiddleware())
    app.use(webNotFoundMiddleware())
    apiLoader(app, oauth, router, __dirname + '/../router/api')
    apiLoader(app, oauth, router, __dirname + '/../router/web')

    return app
}
