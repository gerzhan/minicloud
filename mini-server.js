var koa = require("koa")
var vhost = require('koa-vhost')
var staticServer = require('koa-static')

exports.start = function() {
	var server = koa()
		//static环境,static允许跨域访问
	var subdomain1 = require("./lib/static-minicloud-io-loader")()
	server.use(vhost('static.minicloud.io', subdomain1))
		//metronic环境 
	var subdomain2 = koa()
	subdomain2.use(staticServer('/usr/local/miniyun/www.metronic.com'))
	server.use(vhost('www.metronic.com', subdomain2))
		//portoadmin环境 
	var subdomain3 = koa()
	subdomain3.use(staticServer('/usr/local/miniyun/www.portoadmin.com/HTML'))
	server.use(vhost('www.portoadmin.com', subdomain3))
		//porto环境 
	var subdomain4 = koa()
	subdomain4.use(staticServer('/usr/local/miniyun/www.porto.com/HTML'))
	server.use(vhost('www.porto.com', subdomain4))
		//makeadmin环境 
	var subdomain5 = koa()
	subdomain5.use(staticServer('/usr/local/miniyun/www.makeadmin.com'))
	server.use(vhost('www.makeadmin.com', subdomain5))
		//PHP-Core部分
	var subdomain6 = require("./lib/service-minicloud-io-loader")()
	server.use(vhost('service.minicloud.io', subdomain6))

	server.listen(80)
}