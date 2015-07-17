/**
 * Return page content
 * Priority access to the contents of redis
 * for minicloud 3.0,No relationship with API
 */

/**
 * Module dependencies.
 */
var md5 = require('md5');
var httpClient = require('co-request')
var querystring = require('querystring')
    /**
     * Return page body.
     * 
     * @param {Object} request
     * @return {String} pagePath
     * @api public
     */
module.exports = function*(request, pagePath) {
    var miniHost = request.miniHost //from context-middleware 
    var redisClient = request.redisClient //from context-middleware 
    var context = request.appContext //from context-middleware 
    var version = context.version
    var serverPattern = context.pattern
    var appConfig = context[serverPattern]
    var staticHost = appConfig.static_host

    var params = querystring.stringify({
            version: version,
            mini_host: miniHost
        })
        //redis key
    var redisKey = md5(staticHost + pagePath + "?version=" + version)

    var body = yield redisClient.get(redisKey)
    if (body == null || context.debug) {
        var url = staticHost + pagePath + "?" + params
        var result = yield httpClient(url);
        body = result.body
        yield redisClient.set(redisKey, body)
    }
    return body
}
