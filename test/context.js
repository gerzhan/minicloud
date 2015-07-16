var appConfig = require("../config.json")
var isTravis = Boolean(process.env.CI)
var config = appConfig[process.env.NODE_ENV]
if(isTravis){
	config = appConfig["travis-ci"]
} 
/**
 * Return test App
 * @return {Koa}
 * @api public
 */
exports.getApp = function*(){
	yield initDBTables() 
	var app = yield require("../lib/loader/app-loader")(config) 
	return app.listen()
} 
/**
 * sync model to db
 * @api private
 */
function syncModel(model){
	return function(done) { 
		model.drop(function(err){
			if (err) throw err
			model.sync(function(err){
				if (err) throw err
				return done(null, null)
			})
		}) 
    }
}
/**
 * Create tables from models 
 * @api public
 */
function* initDBTables(){
	var dbPool = yield require("../lib/loader/db-loader")(config)
	var models = dbPool.models 
	for(var i=0;i<models.length;i++){
		var item = models[i] 
		yield syncModel(item)
	}  
}