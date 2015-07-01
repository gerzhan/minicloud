var PageLoader = require("../../../loader/page-content-loader")
/**
 *Web访问管理后台 
 */
exports.dash = function*() { 
	var pageUrl = "/static/dashboard/index.html"	
	this.body = yield PageLoader.getPageContent(pageUrl)
}