/**
 * Module dependencies.
 */
var webHelpers = require('../../../web-helpers')
    /**
     *site page
     * @api public
     */
exports.site = function*() { 
    this.type = 'text/html'
    this.body = yield webHelpers.getPageBootrap(this)
}
