var appConfig = require("../config.json")
var config = appConfig[process.env.NODE_ENV]
exports.getApp = function*(){
	var app = yield require("../lib/loader/app-loader")(config)
	return app.listen()
}
