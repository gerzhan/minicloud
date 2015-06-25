
var fs = require("fs")
var path = require("path")
var rootPath = process.cwd()
var dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()
/**
 *获得管理后台静态资源模板
 */
exports.dash = function*() {
	this.body = dashStaticContent
}
/**
 *获得登陆静态资源模板
 */
exports.login = function*() {
	this.body = loginStaticContent
}
/**
 *获得注册静态资源模板
 */
exports.signup = function*() {
	this.body = signupStaticContent
}