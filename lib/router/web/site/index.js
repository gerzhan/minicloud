var pageLoader = require("../../../loader/page-content-loader")
/**
 *获得登陆页面
 */
exports.login = function*() { 
	var pageUrl = '/api/page/login'	
	this.body = yield pageLoader(this.request,pageUrl)
}
/**
 *获得注册页面
 */
exports.signup = function*() {
	var pageUrl = '/api/page/singup' 
	this.body = yield pageLoader(this.request,pageUrl)
}
/**
 *获得错误页面
 */
exports.error = function*() {
	var pageUrl = '/api/page/error'
	this.body = yield pageLoader(this.request,pageUrl)
}