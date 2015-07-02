var pageLoader = require("../../../loader/page-content-loader")
/**
 *Web访问管理后台 
 */
exports.dash = function*() { 
	var pageUrl = '/api/page/dashboard'	
	this.body = yield pageLoader(this.request,pageUrl)
}