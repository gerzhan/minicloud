var path = require('path')
var fileHelpers = require('../file-helpers')
var ConflictFile = require('./conflict-file').ConflictFile
var MiniVersion = require('./version')
var MiniFileTagRelation = require('./file-tag-relation')
var MiniTag = require('./tag')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel

function MiniFileCore() {}
/**
 * return file by path
 * @param {Integer} userId 
 * @param {String} filePath  
 * @return {Object}    
 * @api public
 */
MiniFileCore.prototype.getFileByPath = function*(userId, filePath) {
        return yield fileModel.findOne({
            where: {
                user_id: userId,
                path_lower: fileHelpers.lowerPath(userId, filePath)
            }
        })
    }
    /**
     * return subfile and subfolder list by path
     * @param {Integer} userId 
     * @param {String} filePath  
     * @return [Array]    
     * @api private
     */
MiniFileCore.prototype.getDescendantsByPath = function*(userId, filePath) {
    var lowerPath = fileHelpers.lowerPath(userId, filePath)
    var fileList = yield fileModel.findAll({
        where: {
            user_id: userId,
            path_lower: {
                $like: lowerPath + '%'
            }
        }
    })
    return fileList
}

/**
 * Create folder 
 * @param {Integer} userId 
 * @param {Object} parentFile 
 * @param {Array} subFolders 
 * @param {Object} options 
 * @return {Object}    
 * @api private
 */
MiniFileCore.prototype.recursiveCreateFolder = function*(userId, parentFile, subFolders, options) {
        if (subFolders.length === 0) {
            return parentFile
        }
        var parentFolderId = -1
        var parentFolderPath = ''
        if (parentFile) {
            parentFolderId = parentFile.id
            parentFolderPath = fileHelpers.relativePath(userId, parentFile.path_lower)
        }
        //create child folder
        var childFolderName = subFolders[0]
            //normalize file name 
        var childFolderPath = parentFolderPath + PATH_SEP + childFolderName
        var childFolderFile = yield this.getFileByPath(userId, childFolderPath)
        if (!childFolderFile) {
            //create folder
            childFolderFile = yield fileModel.create({
                user_id: userId,
                type: 1,
                client_created: new Date().getTime(),
                client_modified: new Date().getTime(),
                name: childFolderName,
                version_id: 0,
                size: 0,
                parent_id: parentFolderId,
                path_lower: fileHelpers.lowerPath(userId, childFolderPath),
                is_deleted: 0
            }, {
                context: options
            })
        }
        var nextSubFolders = subFolders.slice(1, subFolders.length)
        return yield this.recursiveCreateFolder(userId, childFolderFile, nextSubFolders, options)
    }
    /**
     * Create folder 
     * @param {Object} device 
     * @param {String} filePath  
     * @return {Object}    
     * @api private
     */
MiniFileCore.prototype.createFolder = function*(device, filePath, options) {
    options = options || {}
    options.ip = options.ip || '127.0.0.1'
    options.device = device
    var userId = device.user_id
    filePath = fileHelpers.normalizePath(filePath)
    var file = yield this.getFileByPath(userId, filePath)
    if (!file) {
        var subFolders = filePath.split(PATH_SEP)
        subFolders = subFolders.slice(1, subFolders.length)
        file = yield this.recursiveCreateFolder(userId, null, subFolders, options)
    } else {
        var fileName = path.basename(filePath)
        if (fileName !== file.name) {
            //update file name
            file.name = fileName
            file = yield file.save({
                context: options
            })
        }
    }
    return file
}


/**
 * Create file
 * @param {Object} device 
 * @param {String} filePath 
 * @param {Object} version 
 * @param {Object} options  
 * @return {Object}    
 * @api public
 */
MiniFileCore.prototype.createFile = function*(device, filePath, version, options) {
    //option.mode add:It's always a conflict. The autorename strategy is to append a number to the file name. For example "document.txt" might become "document (2).txt". overwrite:It's never a conflict. Overwrite the existing file. The autorename strategy is the same as it is for add. update:It's a conflict only if the current "hash" doesn't match the given "hash". The autorename strategy is to append the string "conflicted copy" to the file name. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt".
    //option.parent_hash If present and mode is update, this parameter specifies the revision of the file you're editing. If parent_hash matches the latest version of the file on the user's MiniCloud, that file will be replaced. Otherwise, a conflict will occur. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt".
    //option.client_modified The value to store as the client_modified timestamp. miniCloud automatically records the time at which the file was written to the miniCloud servers. It can also record an additional timestamp, provided by clients, mobile clients, and API apps of when the file was actually created or modified. This field is optional.
    options = options || {}
    options.ip = options.ip || '127.0.0.1'
    options.device = device

    var userId = device.user_id
    filePath = fileHelpers.normalizePath(filePath)
    var fileName = path.basename(filePath)
    var file = yield this.getFileByPath(userId, filePath)
    if (file) {
        var mode = options.mode || 'add'
        if (file.version_id == version.id) {
            //update file name
            file.name = fileName
            return yield file.save({
                context: options
            })
        } else {
            //update file
            var conflictHandle = new ConflictFile(device, file, filePath, version, options)
            return yield conflictHandle.run()
        }
    }
    //create parent file
    var parentId = -1
    var parentPath = path.dirname(filePath)
    var parentFolder = yield this.createFolder(device, parentPath, options)
    if (parentFolder) {
        parentId = parentFolder.id
    }
    var clientModified = options.clientModified || new Date().getTime()
    options.version = version
        //create file
    var file = yield fileModel.create({
        user_id: userId,
        type: 0,
        client_created: new Date().getTime(),
        client_modified: clientModified,
        name: fileName,
        version_id: version.id,
        size: version.size,
        parent_id: parentId,
        path_lower: fileHelpers.lowerPath(userId, filePath),
        is_deleted: 0,
        mime: fileHelpers.getMime(filePath)
    }, {
        context: options
    })
    return file
}

/**
 * find file by id
 * @param {Integer} id 
 * @return {Object}
 * @api public
 */
MiniFileCore.prototype.getById = function*(id) {
        return yield fileModel.findById(id)
    }
    /**
     * return used size
     * @param {Integer} userId 
     * @return BigInt
     * @api public
     */
MiniFileCore.prototype.getUsedSpaceSize = function*(userId) {
        var column = 'size'
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
    /**
     * set hash to file
     * @param {Object} file  
     * @api private
     */
MiniFileCore.prototype._setHash = function*(file) {
        if (file.type === 0) {
            var version = yield MiniVersion.getById(file.version_id)
            file.hash = version.hash
        }
    }
    /**
     * get full file
     * @param {Object} file  
     * @api private
     */
MiniFileCore.prototype.getFullFile = function*(file) {
        yield this._setHash(file)
        var relationList = yield MiniFileTagRelation.getAllByFileId(file.id)
        var tags = ''
            //return tags
        if (relationList.length > 0) {
            var tagList = []
            for (var i = 0; i < relationList.length; i++) {
                var relation = relationList[i]
                var tag = yield MiniTag.getByTagId(file.user_id, relation.tag_id)
                tagList.push(tag.name)
            }
            tags = ',' + tagList.join(',')
        }
        if (file.type === 0) {
            return {
                tag: 'file' + tags,
                name: file.name,
                path_lower: fileHelpers.relativePath(file.user_id, file.path_lower),
                client_modified: new Date(file.client_modified),
                server_modified: file.updated_at,
                hash: file.hash,
                size: file.size
            }
        }
        return {
            tag: 'folder' + tags,
            name: file.name,
            path_lower: fileHelpers.relativePath(file.user_id, file.path_lower)
        }
    }
    /**
     * delete  file
     * @param {Object} device 
     * @param {String} filePath  
     * @param {Object} options  
     * @api private
     */
MiniFileCore.prototype.fakeDeleteFile = function*(device, filePath, options) {
        options = options || {}
        options.ip = options.ip || '127.0.0.1'
        options.device = device
        var userId = device.user_id
        var lowerPath = fileHelpers.lowerPath(userId, filePath)
        return yield fileModel.update({
            is_deleted: 1
        }, {
            where: {
                user_id: userId,
                is_deleted: 0,
                path_lower: {
                    $like: lowerPath + '%'
                }
            },
            context: options
        })
    }
    /**
     * update  file version
     * @param {Object} device 
     * @param {Object} file 
     * @param {Object} version  
     * @param {Object} options  
     * @api private
     */
MiniFileCore.prototype.updateVersion = function*(device, file, version, options) {
        options = options || {}
        options.ip = options.ip || '127.0.0.1'
        options.device = device
        file.version_id = version.id
        file.size = version.size
        file = yield file.save({
            context: options
        })
        return file
    }
    /**
     * remove files by userId
     * @param {integer} userId
     * @api public
     */
MiniFileCore.prototype.removeAllByUserId = function*(userId) {
        yield fileModel.destroy({
            where: {
                user_id: userId
            }
        })
    }
    /**
     * get files by userId
     * @param {integer} userId
     * @api public
     */
MiniFileCore.prototype.getAllByUserId = function*(userId) {
    return yield fileModel.findAll({
        where: {
            user_id: userId
        }
    })
}
exports.MiniFileCore = MiniFileCore
