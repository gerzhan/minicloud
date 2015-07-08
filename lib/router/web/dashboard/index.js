var pageLoader = require("../../../loader/page-content-loader")
/**
 *dashboard page
 */
exports.dash = function*() { 
	var pageUrl = '/api/page/dashboard'	
	this.body = yield pageLoader(this.request,pageUrl)
}