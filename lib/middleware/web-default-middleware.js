/**
 * Module dependencies.
 */
var webHelpers = require('../web-helpers')
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
        if (currentUrl == '/' || currentUrl == '') {
            var defaultUrl = webHelpers.createUrl(this, '/box', {})
            this.redirect(defaultUrl)
            return
        }
        yield * next
    }
}
