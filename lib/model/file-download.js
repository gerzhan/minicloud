var MiniFileVersion = require('./version')
var md5 = require('md5')
var querystring = require('querystring')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel

function MiniFileDownload() {

}
/**
 * return download file 301 url
 * @param {Object} device 
 * @param {Object} file 
 * @param {Object} version  
 # @param {Boolean} onlineView
 * @return {Object}    
 * @api public
 */
MiniFileDownload.prototype.getDownload301Url = function*(device, file, version, onlineView, defaultHost) {
    var storageConfig = global.appContext.storage || {}
    version = yield MiniFileVersion.getFullVersion(version)
    var storeNode = version.store_node || {
        host: defaultHost,
        safe_code: storageConfig.safe_code
    } 
    var host = storeNode.host
    var safeCode = storeNode.safe_code
    var date = new Date()
    var time = date.getTime()
    var name = file.name
    var hash = version.hash
    var signature = md5(hash + time + safeCode)

    var url = host + '/api/v1/files/download/content?' + querystring.stringify({
        time: time,
        name: name,
        signature: signature,
        hash: hash,
        online_view: onlineView === 1 ? 1 : 0
    })
    return url
}
exports.MiniFileDownload = MiniFileDownload
