
var fs = require("fs")
var path = require("path")
var rootPath = process.env.rootPath 
var dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()

/**
 *获得管理后台静态资源模板
 */
exports.dash = function*() { 
	if(process.env.debug){
		dashStaticContent = fs.readFileSync(path.join(rootPath, "..", "static.minicloud.io", "static", "dashboard", "index.html")).toString()
	}
	this.body = dashStaticContent
}