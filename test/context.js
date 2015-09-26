var config = require('./db-config')
var isTravis = Boolean(process.env.CI)
var client = require('./socket-io-client')
global.timeout = 300000
process.env.ORM_PROTOCOL = process.env.ORM_PROTOCOL || 'sqlite'
var dbConfig = config[process.env.ORM_PROTOCOL]
dbConfig.dialect = process.env.ORM_PROTOCOL
if (!isTravis&&process.env.ORM_PROTOCOL!=='mssql') {
    dbConfig.password = '123456'
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
    yield _initDBTables()
    if (!global.app) {
        var app = yield require('../')(null, {
            database: dbConfig
        })
        global.app = app.listen()
        global.socket = yield initSocketClient(app)
        _deleteFolder('./cache')
        _deleteFolder('./data')
    }
    return global.app
}

/**
 * Create tables from models 
 * @api private
 */

function* _initDBTables() {
    if (!global.sequelizePool) {
        //migration database 
        var migration = require('../lib/migration')
        yield migration.run(dbConfig)
        //init database connect  
        var sequelizePool = yield require('../lib/loader/sequelize-loader')(dbConfig)
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
