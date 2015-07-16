var appConfig = require("../config.json")
var isTravis = Boolean(process.env.CI)
var config = appConfig[process.env.NODE_ENV]
if(isTravis){
	config = appConfig["travis-ci"]
} 
exports.getApp = function*(){
	var app = yield require("../lib/loader/app-loader")(config)
	return app.listen()
}
