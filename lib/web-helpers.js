'use strict'
/**
 * Return referer url
 * @param {Object} request
 * @return {String}
 * @api public
 */
exports.getRefererUrl = function(request) {
        var host = request.header.host
        var url = request.url
        return 'http://' + host + url
    }
    /**
     * Return minicloud host
     * @param {Object} request
     * @return {String}
     * @api public
     */
exports.getMiniHost = function(request) {
        var host = request.header.host
        return 'http://' + host
    }
    /**
     * Create url
     * @param {Object} request
     * @param {String} shortUrl
     * @param {Object} params
     * @return {String}
     * @api public
     */
exports.createUrl = function(request, shortUrl, params) {
        var querystring = require('querystring')
        var host = request.header.host
        var url = 'http://' + host + shortUrl
        if (Object.keys(params).length > 0) {
            url += '?' + querystring.stringify(params)
        }
        return url
    }
    /**
     * throw 401 exception
     * @param {Object} app 
     * @api public
     */
exports.throw401 = function(app) {
        var error = {
            code: 401,
            error: 'invalid_token',
            error_description: 'The access token provided is invalid.'
        }
        app.status = 401
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
    var functionName = url.substring(8,url.length)
    var errors = {
        error:'Error in call to API function '+functionName,
        error_description:app.errors
    }
    app.status = 400
    app.body = errors
}
