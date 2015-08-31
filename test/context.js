var isTravis = Boolean(process.env.CI) 
var config = require('../config-test.json')
if (isTravis) {
    config = require['../config-travis-ci.json']
}
var client = require('./socket-io-client')
process.env.ORM_PROTOCOL = process.env.ORM_PROTOCOL || 'mysql'
process.setMaxListeners(0)
var initSocketClient = function(app) {
        return function(done) {
            var socket = client(app)
            socket.on('connect', function() {
                done(null,socket)
            })
        }
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
            global.socket = yield initSocketClient(app)
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
        yield model.destroy({
            truncate: true
        })
    }
}
