/**
 * Module dependencies.
 */
var co = require('co')
var appConfig = require("./config.json") 
//start app
var config = appConfig[process.env.NODE_ENV] 
co.wrap(function*(){
	var app = yield require("./lib/loader/app-loader")(config)	
	app.listen(config.port)
	console.log(config.port+" is running!")	
})()
