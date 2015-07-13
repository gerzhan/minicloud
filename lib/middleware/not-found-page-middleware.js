/**
 * 404 page
 * request accept 'application/json' render json error info,otherwise render 404 page
 */
var MiniWebUtil = require("../mini-web-util")

module.exports = function(opts) {
	return function* errorPage(next) {
		yield * next  
		if (this.status >= 400) {
			if(!this.request.is('application/json')){
				var url = MiniWebUtil.createUrl(this.request, "/error", {})
				this.redirect(url)
			} 
		}

	}
}