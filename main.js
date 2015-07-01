var debug = true
var config = require("./config.json");
var DBLoader = require("./lib/loader/db-loader"); 
//判断是否调试状态
global.debug = debug
//设置程序路径到进程全局变量中
global.appRootPath = __dirname   
//设置环境变量到进程全局变量中
global.appContext = config
//初始化redis连接
var context = global.appContext
global.redisClient = require('koa-redis')(context.redis) 
//初始化数据库连接
var dbConfig = config.db
var dbLoader = new DBLoader(dbConfig.host, dbConfig.port, dbConfig.name, dbConfig.password, dbConfig.db_name);
dbLoader.initDBConnect(function(err, db) {
	if (err) {
		console.log(err);
		return;
	} 
	//数据库连接全局变量
	global.dbPool = db;
	//启动服务器
	var server = require("./lib/loader/server-loader")()	
	server.listen(3001)
	
});