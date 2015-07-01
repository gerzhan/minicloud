var PageLoader = require("../../../loader/page-content-loader")
/**
 *获得登陆页面
 */
exports.login = function*() {
	var pageUrl = "/static/site/login.html"	
	this.body = yield PageLoader.getPageContent(pageUrl)
}
/**
 *获得注册页面
 */
exports.signup = function*() {
	var pageUrl = "/static/site/signup.html" 
	this.body = yield PageLoader.getPageContent(pageUrl)
}