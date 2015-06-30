var debug = true
var dbConfig = require("./db-config.json");
var DBLoader = require("./lib/loader/db-loader"); 
//判断是否调试状态
process.env.debug = debug
//获得程序路径
process.env.rootPath = __dirname
var dbLoader = new DBLoader(dbConfig.host, dbConfig.port, dbConfig.name, dbConfig.password, dbConfig.db_name);
dbLoader.initDBConnect(function(err, db) {
	if (err) {
		console.log(err);
		return;
	} 
	//数据库连接全局变量
	global.dbPool = db;
	//启动服务器
	var server = require("./lib/service-minicloud-io-loader")()	
	server.listen(3001)
});