var PageLoader = require("../../../loader/page-content-loader")
/**
 *获得错误页面的静态资源模板
 */
exports.error = function*() {
	var pageUrl = "/static/site/error.html"	
	this.body = yield PageLoader.getPageContent(pageUrl)
}
