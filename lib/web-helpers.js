'use strict'
/**
 * Return minicloud host
 * @param {Object} request
 * @return {String}
 * @api public
 */
exports.getMiniHost = function(request) {
        var host = request.header.host
        return "http://" + host
    }
    /**
     * throw 401 exception
     * @param {Object} app 
     * @api public
     */
exports.throwSimple401 = function(app) {
        var error = {
            code: 401,
            error: 'invalid_token',
            error_description: 'The access token provided is invalid.'
        }
        app.status = 401
        app.body = error
    }
    /**
     * throw  exception
     * @param {Object} app 
     * @param {Integer} statusCode
     * @param {String} error 
     * @param {String} description
     * @api public
     */
exports.throw = function(app, statusCode, error, description) {
        var error = {
            code: statusCode,
            error: error,
            error_description: description
        }
        app.status = statusCode
        app.body = error
    }
    /**
     * throw exception
     * @param {Object} app
     * @param {String} error
     * @param {String} description  
     * @api public
     */
exports.throw409 = function(app, error, description) {
        var error = {
            code: 409,
            error: error,
            error_description: description
        }
        app.status = 409
        app.body = error
    }
    /**
     * throw exception 400
     * @param {Object} app 
     * @api public
     */
exports.throw400 = function(app) {
    var url = app.request.url
        // /api/v1/oauth2/token->oauth2/token
    var functionName = url.substring(8, url.length)
    var errors = {
        error: 'Error in call to API function ' + functionName,
        error_description: app.errors
    }
    app.status = 400
    app.body = errors
}
var httpClient = require('co-request')
var querystring = require('querystring')
    /**
     * Return page body.
     * 
     * @param {Object} app
     * @return {String} pagePath
     * @api public
     */
exports.getPageBootrap = function*(app, pagePath) {
        var request = app.request
        var miniHost = request.miniHost //from context-middleware  
        var context = request.appContext //from context-middleware 
        var version = context.version
        var staticHost = context.static_host || 'http://static.minicloud.io'

        var params = querystring.stringify({
            version: version,
            mini_host: miniHost
        })
        var url = staticHost + pagePath + '?' + params
        var result = yield httpClient(url)
        var body = result.body
        return body
    }
    /**
     * Create url
     * @param {Object} app
     * @param {String} shortUrl
     * @param {Object} params
     * @return {String}
     * @api public
     */
exports.createUrl = function(app, shortUrl, params) {
        var request = app.request
        var host = request.header.host
        var url = 'http://' + host + shortUrl
        if (Object.keys(params).length > 0) {
            url += '?' + querystring.stringify(params)
        }
        return url
    }
    /**
     * Return referer url
     * @param {Object} app
     * @return {String}
     * @api public
     */
exports.getRefererUrl = function(app) {
    var request = app.request
    var host = request.header.host
    var url = request.url
    return 'http://' + host + url
}
