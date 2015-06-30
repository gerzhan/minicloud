/**
 * 当用户访问根目录直接跳转到默认页面
 */
var MiniWebUtil = require("../mini-web-util")

module.exports = function(opts) {
	return function* errorPage(next) {
		yield * next
		if (this.status<400) return;
		if (this.accepts('html')) {
			var url = MiniWebUtil.createUrl(this.request, "/error", {})
			this.redirect(url)
		}
	}
}