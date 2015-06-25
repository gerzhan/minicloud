var dbConfig = require("./db-config.json");
var DBLoader = require("./lib/db-loader"); 
var dbLoader = new DBLoader(dbConfig.host, dbConfig.port, dbConfig.name, dbConfig.password, dbConfig.db_name);
dbLoader.initDBConnect(function(err, db) {
	if (err) {
		console.log(err);
		return;
	}
	//数据库连接全局变量
	global.dbPool = db;
	//启动服务器
	require("./mini-server").start(); 
});