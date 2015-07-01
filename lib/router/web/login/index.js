
var fs = require("fs")
var path = require("path")
var rootPath = process.env.rootPath 
var loginStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "login.html")).toString()
var signupStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "signup.html")).toString()
 
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