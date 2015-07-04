/**
 * 当用户访问根目录直接跳转到默认页面
 */
var MiniWebUtil = require("../mini-web-util")

module.exports = function(opts) {
	return function* errorPage(next) {
		yield * next 
		//错误码大于400，显示错误页		
		if (this.status >= 400) {
			if(!this.request.is('application/json')){
				var url = MiniWebUtil.createUrl(this.request, "/error", {})
				this.redirect(url)
			} 
		}

	}
}