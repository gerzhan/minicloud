'use strict'
/**
 * database table minicloud_files CRUD
 */
var fileModel = dbPool.fileModel
var co = require('co')
    /**
     * Create file or directory 
     * @param {Integer} userId 
     * @param {Integer} type 
     * @param {Integer} fileCreateTime 
     * @param {Integer} fileUpdatetime 
     * @param {String} name 
     * @param {Integer} versionId
     * @param {Integer} size
     * @param {String} path 
     * @param {Integer} isDeleted
     * @param {String} mimeType
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, type, fileCreateTime, fileUpdatetime, name, versionId, size, path, isDeleted, mimeType) {
    var file = yield fileModel.coCreate({
        user_id: userId,
        type: type,
        file_created_time: fileCreateTime,
        file_updated_time: fileUpdatetime,
        name: name,
        version_id: versionId,
        size: size,
        path: path,
        is_deleted: isDeleted,
        mime_type: mimeType
    })
    return file
}

/**
 * find file by id
 * @param {Integer} id 
 * @return {Object}
 * @api public
 */

exports.getById = function*(id) {
    var fileList = yield fileModel.coFind({
        id: id
    })
    if (fileList.length > 0) {
        return yield fileList[0]
    }
    return null
}
