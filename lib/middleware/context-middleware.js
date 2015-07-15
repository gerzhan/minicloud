/**
 * set global variables to request
 *
 * @param {Object} opts 
 * @api public
 */
module.exports = function(opts) {
    return function* miniHost(next) {
        var appContext = global.appContext
        var serverPattern = appContext.server_pattern
        var appConfig = appContext[serverPattern]
        var miniHost = this.request.header.host
        if (serverPattern == "hybrid") {
            //hybrid cloud
            miniHost = this.request.header.host
        } else if (serverPattern == "tiny") {
            //tiny cloud
            miniHost = this.request.header.mini_host
        } else if (serverPattern == "private") {
            //private cloud
            miniHost = this.request.header.host
        }
        this.request.miniHost = "http://" + miniHost
        this.request.appContext = global.appContext
        this.request.redisClient = global.redisClient

        yield * next
    }
}
