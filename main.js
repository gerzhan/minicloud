var isDebug  = true;
var appPort  = 80; 
var koa      = require('koa');
var route    = require('koa-route');
var $proxy   = require('koa-http-proxy')
var koa      = require('koa')
var app      = require("./lib/api-loader")();
var session  = require('koa-session');
var dbConfig = require("./db-config.json");
var DBLoader = require("./lib/db-loader");
var dbLoader = new DBLoader(dbConfig.host,dbConfig.port,dbConfig.name,dbConfig.password,dbConfig.db_name);
dbLoader.initDBConnect(function(err,db){
	if(err){
		console.log(err);
		return;
	}
	//var app = koa();
	//app.use(apiLoader(app));
	//数据库连接全局变量
	global.dbPool = db;
	if(isDebug){  
		//搭建开发环境 
		var miniHost = "service.minicloud.io";
		var MiniDev  = require("./mini-dev").MiniDev;
		app.use(session(app));
		var miniEnv  = new MiniDev(app,miniHost,appPort);
		miniEnv.vhost();
	}else{ 
		app.use(session(app));
		//搭建生成环境
		//迷你云通过IP或端口都可访问
		app.use(function *(next){
			this.header["proxy-port"]=appPort; 
			yield next; 
		});
		app.use($proxy('http://127.0.0.1:7070'));
	} 
	app.listen(appPort);
});

