var MiniFileVersion = require('./version')
var md5 = require('md5')
var querystring = require('querystring')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel

function MiniFileThumbnail() {

}
/**
 * return thumbnail file 301 url
 * @param {Object} device 
 * @param {Object} file 
 * @param {Object} size  
 * @return {Object}    
 * @api public
 */
MiniFileThumbnail.prototype.getThumbnail301Url = function*(device, file, size) {
    var version = yield MiniFileVersion.getById(file.version_id)
    version = yield MiniFileVersion.getFullVersion(version)
    var storeNode = version.store_node
    var host = storeNode.host
    var safeCode = storeNode.safe_code
    var date = new Date()
    var time = date.getTime()
    var name = file.name
    var hash = version.hash
    var signature = md5(hash + time + safeCode)
    var size = size
    var url = host + '/api/v1/files/thumbnail?' + querystring.stringify({
        time: time,
        name: name,
        signature: signature,
        hash: hash,
        size: size
    })
    return url
}
exports.MiniFileThumbnail = MiniFileThumbnail
