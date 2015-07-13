var config = require("./config-test.json")
//启动服务器 
var co = require('co')
co.wrap(function*(){
	var server = yield require("./lib/loader/server-loader")(config)	
	server.listen(config.port)
	console.log(config.port+" is running!")	
})()
