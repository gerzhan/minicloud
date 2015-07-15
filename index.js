
var appConfig = require("./config.json") 
var config = appConfig[process.env.NODE_ENV] 
//start app
var co = require('co')
co.wrap(function*(){
	var app = yield require("./lib/loader/app-loader")(config)	
	app.listen(config.port)
	console.log(config.port+" is running!")	
})()
