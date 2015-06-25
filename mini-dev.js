var EventEmitter  = require('events').EventEmitter;
var koa     = require('koa')
var $proxy  = require('koa-http-proxy')
var vhost   = require('koa-vhost');
var util    = require('util');
var session = require('koa-session');
/**
* 迷你云开发环境
*/
function MiniDev(app,host,appPort){ 
	this.app  = app;
	this.host = host;
	this.appPort = appPort;
}
exports.MiniDev = MiniDev;
util.inherits(MiniDev, EventEmitter);
//配置vhost环境
MiniDev.prototype.vhost=function(){
	var self = this;
	var app  = self.app;
	//云盘环境
	var server0 = koa();
	server0.use(function *(next){
		console.log(this)
		this.header["proxy-port"]=self.appPort; 
		yield next; 
	});
	server0.keys = ['some secret hurr'];
	server0.use(session(server0));
	server0.use($proxy('http://127.0.0.1:7070'));
	//static环境 
	var server1 = koa();
	server1.use(function *(next){
		this.header["proxy-port"]=self.appPort; 
		yield next; 
	});
	server1.use($proxy('http://127.0.0.1:7071'));
	//www环境
	var server3 = koa();
	server3.use($proxy('http://127.0.0.1:7072')); 
	//metronic环境
	var staticServer = require('koa-static');
	var server2 = koa(); 
	server2.use(staticServer('/usr/local/miniyun/www.metronic.com'));
	//portoadmin环境 
	var server4 = koa(); 
	server4.use(staticServer('/usr/local/miniyun/www.portoadmin.com/HTML'));
	//portoadmin环境 
	var server5 = koa(); 
	server5.use(staticServer('/usr/local/miniyun/www.porto.com/HTML'));
	//makeadmin环境 
	var server6 = koa(); 
	server6.use(staticServer('/usr/local/miniyun/www.makeadmin.com'));
	//171测试环境 
	var server7 = koa();
	server7.use($proxy('http://127.0.0.1:7073')); 
	//new.static.miniyun.cn测试环境 
	var server8 = koa();
	server8.use(staticServer('/usr/local/miniyun/new.static.miniyun.cn')); 
	//设置vhost
	app.use(vhost([
	{
	    host: this.host,
	    app: server0
	}, 
	{
	    host: 'static.minicloud.io',
	    app: server1
	},
	{
	    host: 'www.metronic.com',
	    app: server2
	},
	{
	    host: 'www.miniyun.cn',
	    app: server3
	},
	{
	    host: 'www.portoadmin.com',
	    app: server4
	},
	{
	    host: 'www.porto.com',
	    app: server5
	},
	{
	    host: 'www.makeadmin.com',
	    app: server6
	},
	{
	    host: '171.miniyun.cn',
	    app: server7
	},
	{
	    host: 'new.static.miniyun.cn',
	    app: server8
	},
	]));
	app.use(function *(next){
		this.header["proxy-port"]=80; 
		yield next; 
	});
	app.use($proxy('http://127.0.0.1:7070'));
}
