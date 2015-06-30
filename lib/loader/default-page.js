/**
 * 当用户访问根目录直接跳转到默认页面
 */
var MiniWebUtil = require("../mini-web-util")

module.exports = function(opts) {
	opts = opts || {};
	return function* defaultPage(next) { 
		//根目录直接跳转到box
		var currentUrl = this.request.url 
		if(currentUrl=="/" || currentUrl==""){
			var defaultUrl = MiniWebUtil.createUrl(this.request, "/box", {
			})
			this.redirect(defaultUrl)
			return
		}	
		yield * next		 
	};

}