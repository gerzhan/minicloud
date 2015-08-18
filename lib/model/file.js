'use strict'
var path = require('path')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel
var PATH_SEP = '/'
    /**
     * return lower path 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var lowerPath = function(userId, filePath) {
        var absolutePath = PATH_SEP + userId + filePath
        return absolutePath.toLowerCase()
    }
    /**
     * return relative path 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var relativePath = function(userId,dbFilePath){
    var prefix = PATH_SEP + userId
    var newPath = dbFilePath.substring(prefix.length,dbFilePath.length)
    return newPath
}
    /**
     * return file by path
     * @param {Integer} userId 
     * @param {String} filePath  
     * @return {Object}    
     * @api private
     */
var getFileByPath = function*(userId, filePath) {
        return yield fileModel.findOne({
            where: {
                user_id: userId,
                lower_path: lowerPath(userId, filePath)
            }
        })
    }
    /**
     * Create folder 
     * @param {Integer} userId 
     * @param {Object} parentFile 
     * @param {Array} subFolders 
     * @return {Object}    
     * @api private
     */
var recursiveCreateFolder = function*(userId, parentFile, subFolders) {
        if (subFolders.length ===0) {
            return parentFile
        }
        var parentFolderId = -1
        var parentFolderPath = ''
        if (parentFile) {
            parentFolderId = parentFile.id
            parentFolderPath = relativePath(userId,parentFile.lower_path)
        }
        //create child folder
        var childFolderName = subFolders[0]
        var childFolderPath = parentFolderPath + PATH_SEP + childFolderName
        var childFolderFile = yield getFileByPath(userId, childFolderPath)
        if (!childFolderFile) {
            //create folder
            childFolderFile = yield fileModel.create({
                user_id: userId,
                type: 0,
                file_created_at: new Date(),
                file_updated_at: new Date(),
                name: childFolderName,
                version_id: 0,
                size: 0,
                parent_id: parentFolderId,
                lower_path: lowerPath(userId, childFolderPath),
                is_deleted: 0
            })
        }
        var nextSubFolders = subFolders.slice(1, subFolders.length)
        return yield recursiveCreateFolder(userId, childFolderFile, nextSubFolders)
    }
    /**
     * Create folder 
     * @param {Integer} userId 
     * @param {String} filePath  
     * @return {Object}    
     * @api private
     */
var createFolder = function*(userId, filePath) {
    var file = yield getFileByPath(userId, filePath)
    if (!file) {
        filePath = path.normalize(filePath)
        var subFolders = filePath.split(PATH_SEP)
        subFolders = subFolders.slice(1, subFolders.length)
        file = yield recursiveCreateFolder(userId, null, subFolders)
    }
    return file
}
exports.createFolder = createFolder
exports.getByPath = getFileByPath
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
        lower_path: path,
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
    /**
     * return used size
     * @param {Integer} userId 
     * @return BigInt
     * @api public
     */
exports.getUsedSpaceSize = function*(userId) {
    var column = 'size'
    if (global.oldVersion) {
        column = 'file_size'
    }
    var sumSpace = yield fileModel.sum(column, {
        where: {
            user_id: userId
        }
    })
    if (sumSpace) {
        return sumSpace
    }
    return 0
}
