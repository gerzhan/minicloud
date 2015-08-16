'use strict'
/**
 * database table minicloud_files CRUD
 */
var fileModel = sequelizePool.fileModel
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
    return yield fileModel.create({
        user_id: userId,
        type: type,
        file_created_at: fileCreateTime,
        file_updated_at: fileUpdatetime,
        name: name,
        version_id: versionId,
        size: size,
        path: path,
        is_deleted: isDeleted,
        mime_type: mimeType
    })
}

/**
 * find file by id
 * @param {Integer} id 
 * @return {Object}
 * @api public
 */

exports.getById = function*(id) {
    return yield fileModel.findById(id)
}
