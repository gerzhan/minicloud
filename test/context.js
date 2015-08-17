var appConfig = require('../config.json')
process.env.ORM_PROTOCOL = process.env.ORM_PROTOCOL || 'mysql'
var isTravis = Boolean(process.env.CI)
var config = appConfig[process.env.NODE_ENV]
process.setMaxListeners(0)
if (isTravis) {
    config = appConfig['travis-ci']
}
/**
 * Return test App
 * @return {Koa}
 * @api public
 */
exports.getApp = function*() {
        yield initDBTables()
        var app = yield require('../lib/loader/app-loader')(config)
        return app.listen()
    } 
/**
 * Create tables from models 
 * @api public
 */
function* initDBTables() { 
    var sequelizePool = yield require('../lib/loader/sequelize-loader')(config)
    var models = sequelizePool.models
    for (var i = 0; i < models.length; i++) {
        var model = models[i]
        yield model.drop()
        yield model.sync()
    }
}
