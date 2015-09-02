/**
 * Module dependencies.
 */
var Resource = require('koa-resource-router')
var debug = require('debug')('api')
var path = require('path')
var fs = require('fs')
var filter = require('koa-json-filter')

/**
 * Load resources in `root` directory. * 
 *
 * @param {Object} oauth
 * @param {Object} router
 * @param {String} root
 * @api public
 */
module.exports = function(app, oauth, router, root) {
    fs.readdirSync(root).forEach(function(file) {
        var dir = path.resolve(root, file)
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
            //socket.io
            app.io.route(apiPath, function*(next, ioRequest) {
                //reset filter
                this.filter = null
                this.errors = null
                ioRequest = ioRequest || {}
                ioRequest.data = ioRequest.data || {}
                ioRequest.header = ioRequest.header || {}

                var request = this.request || {}
                request.method = 'POST'
                request.body = ioRequest.data
                request.query = request.query || {}
                request.get = function(headerkey) {
                    return ioRequest.header[headerkey]
                }
                request.is = function(type) {
                    return true
                }
                this.req = request
                this.request = request

                var response = this.response || {}
                response.set = function(data) {}
                this.response = response
                this.res = response

                yield next
            })
        }
        //validate access_token
        var validAccessToken = true
        if (typeof(conf.valid_access_token) != 'undefined' && !conf.valid_access_token) {
            validAccessToken = false
        }
        if (validAccessToken) {
            router.use(apiPath, oauth.authorise())
                //socket.io
            app.io.route(apiPath, oauth.authorise())
        }
        //default user role equal 1
        var roles = COMMON_USER
        if (typeof(conf.roles) != 'undefined' && conf.roles) {
            roles = conf.roles
        }
        if (roles != COMMON_USER) {
            var validRole = require('../middleware/valid-role-middleware')
            router.use(apiPath, validRole({
                    roles: roles
                }))
                //socket.io
            app.io.route(apiPath, validRole({
                roles: roles
            }))
        }


        if (isApi) {
            //support filter 
            router.use(require('koa-validate')())
            router.use(filter())
            router.use(apiPath, bodyParser())
            router.post(apiPath, fn)
                //socket.io don't add filter middleware,koa.io will filter
            app.io.route(apiPath, require('koa-validate')())
            app.io.route(apiPath, fn)
        }
    }
}
