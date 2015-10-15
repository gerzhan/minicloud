/**
 * Module dependencies.
 */
var webHelpers = require('../../../web-helpers')
    /**
     *box page
     * @api public
     */
exports.box = function*() { 
	this.type = 'text/html'
    this.body = yield webHelpers.getPageBootrap(this)
}
