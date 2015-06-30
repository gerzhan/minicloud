'use strict'

/**
 * 获得当前请求的Url地址
 * TODO HTTPS/非80端口/二次代理转发支持
 */
exports.getRefererUrl = function(request) { 
	var host = request.header.host
	var url = request.url
	return "http://"+host+url
}
/**
 * 获得迷你服务器主机地址
 * TODO HTTPS/非80端口/二次代理转发支持
 */
exports.getMiniHost = function(request) {
	var host = request.header.host 
	return "http://"+host
}
/**
 * 创建url地址
 * TODO HTTPS/非80端口/二次代理转发支持
 */
var querystring = require("querystring")
exports.createUrl = function(request,shortUrl,params) {
	var host = request.header.host 
	var url = "http://"+host+shortUrl+"?"+querystring.stringify(params)
	return url
}