/**
 * Module dependencies.
 */
var Resource = require('koa-resource-router')
var debug = require('debug')('api')
var path = require('path')
var fs = require('fs')
var join = path.resolve
var filter = require('koa-json-filter')
var readdir = fs.readdirSync

/**
 * Load resources in `root` directory. * 
 *
 * @param {Object} oauth
 * @param {Object} router
 * @param {String} root
 * @api public
 */
module.exports = function(app, oauth, router, root) {
    readdir(root).forEach(function(file) {
        var dir = join(root, file)
        var stats = fs.lstatSync(dir)
        if (stats.isDirectory()) {
            var conf = require(dir + '/config.json')
            conf.name = file
            conf.directory = dir
            route(app, oauth, router, conf)
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

function route(app, oauth, router, conf) {
    var bodyParser = require('koa-bodyparser')

    var mod = require(conf.directory)

    for (var key in conf.routes) {
        var prop = conf.routes[key];
        var apiPath = key.split(' ')[0]
        var fn = mod[prop]
        if (!fn) throw new Error(conf.name + ': exports.' + prop + ' is not defined')
            //validate access_token
        var validAccessToken = true
        if (typeof(conf.valid_access_token) != 'undefined' && !conf.valid_access_token) {
            validAccessToken = false
        }
        if (validAccessToken) {
            router.use(apiPath, oauth.authorise())
            app.io.route(apiPath, oauth.authorise())
        }
        //validate administrator access_token
        var validAdminAccessToken = false
        if (typeof(conf.valid_admin_access_token) != 'undefined' && conf.valid_admin_access_token) {
            validAdminAccessToken = true
        }
        if (validAdminAccessToken) {
            var validAdmin = require('../middleware/valid-admin-access-token-middleware')
            router.use(apiPath, validAdmin())
            app.io.route(apiPath, validAdmin())
        }

        //api only support post
        //not api only support get
        var isApi = false
        if (apiPath.length > 5) {
            var prefix = apiPath.substring(0, 5)
            if (prefix == '/api/') {
                isApi = true
            }
        }
        if (isApi) {
            //support filter 
            router.use(require('koa-validate')())
            router.use(filter())
            router.use(apiPath, bodyParser())
            router.post(apiPath, fn)
                //socket.io
            app.io.route(apiPath, require('koa-validate')())
            app.io.route(apiPath, filter())
            app.io.route(apiPath, function*(next, ioRequest) {
                var self = this
                var request = this.request || {}
                request.method = 'POST'
                request.body = ioRequest.data
                request.is = function(type) {
                    return true
                }
                this.req = request
                this.request = request

                var response = this.response || {}
                response.set = function(data) {}
                this.response = response
                this.res = response

                yield fn
            })
        }
    }
}
