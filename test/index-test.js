var config = require("./config-test.json")
//start server
var co = require('co')
co.wrap(function*(){
	var server = yield require("../lib/loader/server-loader")(config)	
	server.listen(config.port)
	console.log(config.port+" is running!")	
})()
