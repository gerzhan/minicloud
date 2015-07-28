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
        return "http://" + host + url
    }
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
     * Create url
     * @param {Object} request
     * @param {String} shortUrl
     * @param {Object} params
     * @return {String}
     * @api public
     */
var querystring = require("querystring")
exports.createUrl = function(request, shortUrl, params) {
    var host = request.header.host
    var url = "http://" + host + shortUrl
    if (Object.keys(params).length > 0) {
        url += "?" + querystring.stringify(params)
    }
    return url
}
