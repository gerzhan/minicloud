var config = require('./config')
var isTravis = Boolean(process.env.CI)
global.timeout = 30000
var client = require('./socket-io-client')
process.env.ORM_PROTOCOL = process.env.ORM_PROTOCOL || 'sqlite'
if (!isTravis) {
    var dbConfig = config[process.env.ORM_PROTOCOL]
    dbConfig.password = dbConfig.password || '123456'
}
process.setMaxListeners(0)
var initSocketClient = function(app) {
        return function(done) {
            var socket = client(app)
            socket.on('connect', function() {
                done(null, socket)
            })
        }
    }
    /**
     * delete folder
     * @param {String} sourcePath
     * @param {String} aimPath   
     * @return {Boolean}
     * @api private
     */
var _deleteFolder = function(filePath) {
        var path = require('path')
        var fs = require('fs')
        var files = []
        if (fs.existsSync(filePath)) {
            files = fs.readdirSync(filePath)
            files.forEach(function(file, index) {
                var curPath = path.join(filePath, file)
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    _deleteFolder(curPath)
                } else { // delete file
                    fs.unlinkSync(curPath)
                }
            })
            fs.rmdirSync(filePath)
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
            _deleteFolder('./cache')
            _deleteFolder('./data')
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
