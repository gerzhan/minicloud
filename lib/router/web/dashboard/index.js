/**
 * Module dependencies.
 */
var pageLoader = require('../../../loader/page-content-loader')
/**
 *dashboard page
 * @api public
 */
exports.dash = function*() { 
	var pageUrl = '/api/page/dashboard'	
	this.body = yield pageLoader(this.request,pageUrl)
}