/**
 * Module dependencies.
 */
var pageLoader = require("../../../loader/page-content-loader")
/**
 *login page
 * @api public
 */
exports.login = function*() { 
	var pageUrl = '/api/page/login'	
	this.body = yield pageLoader(this.request,pageUrl)
}
/**
 *singup page
 * @api public
 */
exports.signup = function*() {
	var pageUrl = '/api/page/signup' 
	this.body = yield pageLoader(this.request,pageUrl)
}
/**
 *error page
 * @api public
 */
exports.error = function*() {
	var pageUrl = '/api/page/error'
	this.body = yield pageLoader(this.request,pageUrl)
}