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
        if (!global.app) {
            var app = yield require('../lib/loader/app-loader')(config)
            global.app = app.listen()
        }
        return global.app

    }
    /**
     * Create tables from models 
     * @api public
     */
function* initDBTables() {
    if (!global.sequelizePool) {
        var sequelizePool = yield require('../lib/loader/sequelize-loader')(config)
        var models = sequelizePool.models
        for (var i = 0; i < models.length; i++) {
            var model = models[i]
            yield model.drop()
            yield model.sync()
        }
        global.sequelizePool = sequelizePool
    }
    //clean table
    var models = global.sequelizePool.models
    for (var i = 0; i < models.length; i++) {
        var model = models[i] 
        yield model.destroy({truncate:true}) 
    }
}
