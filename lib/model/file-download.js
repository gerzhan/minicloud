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
 * @return {Object}    
 * @api public
 */
MiniFileDownload.prototype.getDownload301Url = function*(device, file, version) {
    version = yield MiniFileVersion.getFullVersion(version)
    var storeNode = version.store_node
    var host = storeNode.host
    var safeCode = storeNode.safe_code
    var date = new Date()
    var time = date.getTime()
    var name = file.name
    var hash = version.hash
    var signature = md5(hash + time + safeCode)

    var url = host + '/api/v1/files/download?' + querystring.stringify({
        time: time,
        name: name,
        signature: signature,
        hash: hash
    })
    return url
}
exports.MiniFileDownload = MiniFileDownload
