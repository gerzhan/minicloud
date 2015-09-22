/**
 * Module dependencies.
 */
var router = require('koa-router')()
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
var initAppConfig = function(opts) {
        //set default config
        opts = opts || {}
        opts.port = opts.port || 8030
        opts.logs = opts.logs || './logs'
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
module.exports = function*(app, opts) { 
    opts = initAppConfig(opts) 
        //load minicloud storage package
    app = yield require('minicloud-storage')(app, opts.storage) 
    global.testModel = env == 'test'
    global.PATH_SEP = '/'
    global.SUPER_ADMIN = 9
    global.SUB_ADMIN = 3
    global.COMMON_USER = 1
        //init db connect 
    global.sequelizePool = yield require("./sequelize-loader")(opts.database)
        //init appContext
    global.appContext = opts

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
