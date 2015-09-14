/**
 * Module dependencies.
 */
var webHelpers = require('../../../web-helpers')
    /**
     *dashboard page
     * @api public
     */
exports.dash = function*() {
    var pageUrl = '/api/page/dashboard'
    this.body = yield webHelpers.getPageBootrap(this, pageUrl)
}
