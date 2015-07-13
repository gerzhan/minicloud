/**
 * default page middleware
 * default page /box
 */
var MiniWebUtil = require("../mini-web-util")

module.exports = function(opts) {
    opts = opts || {};
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
