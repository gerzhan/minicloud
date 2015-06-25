var koa    = require("koa")
var $proxy = require('koa-http-proxy')
var vhost = require('koa-vhost')
var cors = require('kcors')
exports.start = function() {
	var server = require("./lib/api-loader")();
	//static环境,static允许跨域访问
	var staticServer = require('koa-static');
	var subdomain1 = koa();
	subdomain1.use(cors());
	subdomain1.use(staticServer('/usr/local/miniyun/static.minicloud.io'));
	server.use(vhost('static.minicloud.io', subdomain1));
	//metronic环境 
	var subdomain2 = koa();
	subdomain2.use(staticServer('/usr/local/miniyun/www.metronic.com'));
	server.use(vhost('www.metronic.com', subdomain2));
	//portoadmin环境 
	var subdomain3 = koa();
	subdomain3.use(staticServer('/usr/local/miniyun/www.portoadmin.com/HTML'));
	server.use(vhost('www.portoadmin.com', subdomain3));
	//porto环境 
	var subdomain4 = koa();
	subdomain4.use(staticServer('/usr/local/miniyun/www.porto.com/HTML'));
	server.use(vhost('www.porto.com', subdomain4));
	//makeadmin环境 
	var subdomain5 = koa();
	subdomain5.use(staticServer('/usr/local/miniyun/www.makeadmin.com'));
	server.use(vhost('www.makeadmin.com', subdomain5));
 
 	server.listen(80);
}