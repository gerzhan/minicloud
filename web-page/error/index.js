
var fs = require("fs")
var path = require("path")
var rootPath = process.env.rootPath 
var errorStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "error.html")).toString()

/**
 *获得错误页面的静态资源模板
 */
exports.error = function*() {
	if(process.env.debug){
		loginStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "site", "error.html")).toString()
	}
	this.body = errorStaticContent
}
