var pageLoader = require("../../../loader/page-content-loader")
/**
 *login page
 */
exports.login = function*() { 
	var pageUrl = '/api/page/login'	
	this.body = yield pageLoader(this.request,pageUrl)
}
/**
 *singup page
 */
exports.signup = function*() {
	var pageUrl = '/api/page/singup' 
	this.body = yield pageLoader(this.request,pageUrl)
}
/**
 *error page
 */
exports.error = function*() {
	var pageUrl = '/api/page/error'
	this.body = yield pageLoader(this.request,pageUrl)
}