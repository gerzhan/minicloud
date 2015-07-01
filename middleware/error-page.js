/**
 * 当用户访问根目录直接跳转到默认页面
 */
var MiniWebUtil = require("../lib/mini-web-util")

module.exports = function(opts) {
	return function* errorPage(next) {
		yield * next
		//如接受类型有json，说明是接口方式请求，返回json错误信息，而不是错误页面
		var acceptType = this.accepts('html', 'json')
		if(acceptType=="json") return
		//错误码大于400，显示错误页		
		if (this.status >= 400) {
			var url = MiniWebUtil.createUrl(this.request, "/error", {})
			this.redirect(url)
		}

	}
}