'use strict'
/**
 * util tolls 
 */
/** 
 * TODO HTTPS/非80端口/二次代理转发支持
 */
exports.getRefererUrl = function(request) { 
	var host = request.header.host
	var url = request.url
	return "http://"+host+url
}
/**
 * return minicloud host
 * TODO HTTPS/非80端口/二次代理转发支持
 */
exports.getMiniHost = function(request) {
	var host = request.header.host 
	return "http://"+host
}
/**
 * Create an absolute url
 * TODO HTTPS/非80端口/二次代理转发支持
 */
var querystring = require("querystring")
exports.createUrl = function(request,shortUrl,params) {
	var host = request.header.host 
	var url = "http://"+host+shortUrl  
	if(Object.keys(params).length>0){
		url+="?"+querystring.stringify(params)
	}
	return url
}