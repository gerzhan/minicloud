/**
 * 当用户访问根目录直接跳转到默认页面
 */
var MiniWebUtil = require("../mini-web-util")

module.exports = function(opts) {
	return function* errorPage(next) {
		yield * next
		//GET方式并错误码大于400，则显示错误页面
		if (this.request.method == "get" && this.status >= 400) {
			var url = MiniWebUtil.createUrl(this.request, "/error", {})
			this.redirect(url)
		}

	}
}