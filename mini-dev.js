var EventEmitter  = require('events').EventEmitter;
var koa     = require('koa')
var $proxy  = require('koa-http-proxy')
var vhost   = require('koa-vhost');
var util    = require('util');
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
		this.header["proxy-port"]=self.appPort; 
		yield next; 
	});
	server0.use($proxy('http://127.0.0.1:7070'));
	//static环境 
	var server1 = koa();
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
	//设置vhost
	app.use(vhost([
	{
	    host: this.host,
	    app: server0
	}, 
	{
	    host: 'static.miniyun.cn',
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
	]));
}
