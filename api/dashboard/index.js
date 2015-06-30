var fs = require("fs")
var path = require("path")
var rootPath = process.env.rootPath
var dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()
	/**
	 *Web访问管理后台
	 *根据当前cookie.token判断用户是否有效
	 */
exports.dash = function*() {
	if (process.env.debug) {
		dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()
	}
	this.body = dashStaticContent
}