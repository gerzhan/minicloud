
var fs = require("fs")
var path = require("path")
var rootPath = process.cwd()
var dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()
var loginStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "login.html")).toString()
var signupStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "signup.html")).toString()

/**
 *获得管理后台静态资源模板
 */
exports.dash = function*() {
	if(process.env.debug){
		dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()
	}
	this.body = dashStaticContent
}
/**
 *获得登陆静态资源模板
 */
exports.login = function*() {
	if(process.env.debug){
		loginStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "login.html")).toString()
	}
	this.body = loginStaticContent
}
/**
 *获得注册静态资源模板
 */
exports.signup = function*() {
	if(process.env.debug){
		signupStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "signup.html")).toString()
	}
	this.body = signupStaticContent
}