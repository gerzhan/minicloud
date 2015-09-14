/**
 * Module dependencies.
 */
var webHelpers = require('../../../web-helpers')
    /**
     *login page
     * @api public
     */
exports.login = function*() {
        var pageUrl = '/api/page/login'
        this.body = yield webHelpers.getPageBootrap(this, pageUrl)
    }
    /**
     *singup page
     * @api public
     */
exports.signup = function*() {
        var pageUrl = '/api/page/signup'
        this.body = yield webHelpers.getPageBootrap(this, pageUrl)
    }
    /**
     *error page
     * @api public
     */
exports.error = function*() {
    var pageUrl = '/api/page/error'
    this.body = yield webHelpers.getPageBootrap(this, pageUrl)
}
