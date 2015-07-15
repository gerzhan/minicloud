/**
 * Module dependencies.
 */
var MiniWebUtil = require("../mini-web-util")
/**
 * default page middleware
 * default page /box
 * @param {Object} opts 
 * @api public
 */
module.exports = function(opts) {
    opts = opts || {}
    return function* defaultPage(next) {
        var currentUrl = this.request.url 
        if (currentUrl == "/" || currentUrl == "") {
            var defaultUrl = MiniWebUtil.createUrl(this.request, "/box", {})
            this.redirect(defaultUrl)
            return
        }
        yield * next
    }

}
