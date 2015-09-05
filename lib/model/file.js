'use strict'
var path = require('path')
var fileHelpers = require('../file-helpers')
var ConflictFile = require('./conflict-file').ConflictFile
var MiniFileMeta = require('./file-meta')
var MiniVersion = require('./version')
var HookFile = require('./hook-file')
    //add hook
HookFile.run()
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel
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
var getDescendantsByPath = function*(userId, filePath) {
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
 * @return {Object}    
 * @api private
 */
var recursiveCreateFolder = function*(userId, parentFile, subFolders) {
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
        var childFolderFile = yield getFileByPath(userId, childFolderPath)
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
            })
        }
        var nextSubFolders = subFolders.slice(1, subFolders.length)
        return yield recursiveCreateFolder(userId, childFolderFile, nextSubFolders)
    }
    /**
     * Create folder 
     * @param {Object} deivce 
     * @param {String} filePath  
     * @return {Object}    
     * @api private
     */
var createFolder = function*(deivce, filePath) {
    var userId = deivce.user_id
    filePath = fileHelpers.normalizePath(filePath)
    var file = yield getFileByPath(userId, filePath)
    if (!file) {
        var subFolders = filePath.split(PATH_SEP)
        subFolders = subFolders.slice(1, subFolders.length)
        file = yield recursiveCreateFolder(userId, null, subFolders)
    } else {
        var fileName = path.basename(filePath)
            //update file name
        file.name = fileName
        file = yield file.save()
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
var createFile = function*(device, filePath, version, options) {
    //option.mode add:It's always a conflict. The autorename strategy is to append a number to the file name. For example "document.txt" might become "document (2).txt". overwrite:It's never a conflict. Overwrite the existing file. The autorename strategy is the same as it is for add. update:It's a conflict only if the current "hash" doesn't match the given "hash". The autorename strategy is to append the string "conflicted copy" to the file name. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt".
    //option.parent_hash If present and mode is update, this parameter specifies the revision of the file you're editing. If parent_hash matches the latest version of the file on the user's MiniCloud, that file will be replaced. Otherwise, a conflict will occur. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt".
    //option.client_modified The value to store as the client_modified timestamp. miniCloud automatically records the time at which the file was written to the miniCloud servers. It can also record an additional timestamp, provided by clients, mobile clients, and API apps of when the file was actually created or modified. This field is optional.
    var userId = device.user_id
    options = options || {}
    filePath = fileHelpers.normalizePath(filePath)
    var fileName = path.basename(filePath)
    var file = yield getFileByPath(userId, filePath)
    if (file) {
        var mode = options.mode || 'add'
        if (file.version_id == version.id) {
            //update file name
            file.name = fileName
            return yield file.save()
        } else {
            //update file
            var conflictHandle = new ConflictFile(device, file, filePath, version, options)
            return yield conflictHandle.run()
        }
    }
    //create parent file
    var parentId = -1
    var parentPath = path.dirname(filePath)
    var parentFolder = yield createFolder(device, parentPath)
    if (parentFolder) {
        parentId = parentFolder.id
    }
    var clientModified = options.clientModified || new Date().getTime()
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
        device: device,
        version: version
    })
    return file
}

/**
 * find file by id
 * @param {Integer} id 
 * @return {Object}
 * @api public
 */
var getById = function*(id) {
        return yield fileModel.findById(id)
    }
    /**
     * return used size
     * @param {Integer} userId 
     * @return BigInt
     * @api public
     */
var getUsedSpaceSize = function*(userId) {
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
    /**
     * set hash to file
     * @param {Object} file  
     * @api private
     */
var setHash = function*(file) {
        if (file && file.type === 0) {
            var version = yield MiniVersion.getById(file.version_id)
            file.hash = version.hash
        }
        file.client_modified = new Date(file.client_modified)
    }
    /**
     * get full file
     * @param {Object} file  
     * @api private
     */
var getFullFile = function*(file) {
        yield setHash(file)
        file.path_lower = fileHelpers.relativePath(file.user_id, file.path_lower)
        return file
    }
    /**
     * delete  file
     * @param {Integer} userId 
     * @param {String} filePath  
     * @api private
     */
var fakeDeleteFile = function*(userId, filePath, context) {
    var lowerPath = fileHelpers.lowerPath(userId, filePath)
    return yield fileModel.update({
        is_deleted: true
    }, {
        where: {
            user_id: userId,
            is_deleted: false,
            path_lower: {
                $like: lowerPath + '%'
            }
        },
        context: context
    })
}
exports.createFile = createFile
exports.createFolder = createFolder
exports.getById = getById
exports.getUsedSpaceSize = getUsedSpaceSize
exports.getByPath = getFileByPath
exports.getFullFile = getFullFile
exports.fakeDeleteFile = fakeDeleteFile
exports.getDescendantsByPath = getDescendantsByPath

/**
 * Copy file or folder
 * @param {Object} device 
 * @param {String} fromPath 
 * @param {String} toPath 
 * @param {Object} options  
 * @return {Object}    
 * @api public
 */
var MiniCopyFile = function(device, fromPath, toPath, options) {
        options = options || {}
        this.device = device
        this.fromPath = fileHelpers.normalizePath(fromPath)
        this.toPath = fileHelpers.normalizePath(toPath)
        this.options = options
    }
    /**
     * Copy folder   
     * @return {Object}    
     * @api private
     */
MiniCopyFile.prototype._copyFolder = function*() {
        var userId = this.device.user_id
        var fromPath = this.fromPath
        var files = yield getDescendantsByPath(userId, fromPath)
        var rootPath = this.toPath
        for (var i = 0; i < files.length; i++) {
            var df = files[i]
            var lowerPath = fileHelpers.relativePath(userId, df.path_lower)
            if (lowerPath == fromPath.toLowerCase()) {
                toPath = this.toPath
            } else {
                var name = df.name
                var relativePath = lowerPath.substring(fromPath.length, lowerPath.length)
                var toPath = path.join(rootPath, relativePath)
                toPath = path.join(path.dirname(toPath), name)
            }
            yield this._copyFile(df, toPath)
        }
    }
    /**
     * Copy file or folder 
     * @return {Object}    
     * @api public
     */
MiniCopyFile.prototype.copy = function*() {
        var userId = this.device.user_id
            //tofile existed,autorename tofile name 
        var toPath = this.toPath
        var toFile = yield getFileByPath(userId, toPath)
        var toName = path.basename(toPath)
        if (toFile) {
            toPath = yield fileHelpers.getNumberFileName(toFile, toName, 1)
        }
        this.toPath = toPath
        var fromPath = this.fromPath
        var fromFile = yield getFileByPath(userId, fromPath)
        if (fromFile.type === 0) {
            //copy file
            yield this._copyFile(fromFile)
        }
        if (fromFile.type === 1) {
            //copy folder
            yield this._copyFolder()
        }
    }
    /*
     * Copy One file or folder
     * @param {Object} fromFile 
     * @param {String} toFilePath 
     * @return {Object}    
     * @api private
     */
MiniCopyFile.prototype._copyFile = function*(fromFile, toFilePath) {
        var device = this.device
        var userId = device.user_id
        var toFilePath = toFilePath || this.toPath
            //create to file parent file
        var toFileParentPath = path.dirname(toFilePath)
        var toName = path.basename(toFilePath)
        var toFileParent = yield createFolder(device, toFileParentPath)
        if (fromFile.type === 0) {
            //copy one file
            var version = yield MiniVersion.getById(fromFile.version_id)
            yield fileModel.create({
                user_id: userId,
                type: fromFile.type,
                client_created: new Date().getTime(),
                client_modified: fromFile.client_modified,
                name: toName,
                version_id: version.id,
                size: version.size,
                parent_id: toFileParent.id,
                path_lower: fileHelpers.lowerPath(userId, toFilePath),
                is_deleted: 0,
                mime: fileHelpers.getMime(toFilePath)
            }, {
                device: this.device,
                version: version
            })
        }
        if (fromFile.type === 1) {
            //copy one folder 
            yield fileModel.create({
                user_id: userId,
                type: fromFile.type,
                client_created: new Date().getTime(),
                client_modified: fromFile.client_modified,
                name: toName,
                version_id: 0,
                size: 0,
                parent_id: toFileParent.id,
                path_lower: fileHelpers.lowerPath(userId, toFilePath),
                is_deleted: 0,
                mime: null
            }, {
                device: device
            })
        }
    }
    /**
     * Copy file or folder
     * @param {Object} device 
     * @param {String} fromPath 
     * @param {String} toPath 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
var copy = function*(device, fromPath, toPath, options) {
    var MiniCopy = new MiniCopyFile(device, fromPath, toPath, options)
    return yield MiniCopy.copy()
}
exports.copy = copy
    /**
     * Move file or folder
     * @param {Object} device 
     * @param {String} fromPath 
     * @param {String} toPath 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
var MiniMoveFile = function(device, fromPath, toPath, options) {
        options = options || {}
        this.device = device
        this.fromPath = fileHelpers.normalizePath(fromPath)
        this.toPath = fileHelpers.normalizePath(toPath)
        this.options = options
    }
    /**
     * Move folder   
     * @return {Object}    
     * @api private
     */
MiniMoveFile.prototype._moveFolder = function*() {
        var userId = this.device.user_id
        var fromPath = this.fromPath
        var files = yield getDescendantsByPath(userId, fromPath)
        var rootPath = this.toPath
        for (var i = 0; i < files.length; i++) {
            var df = files[i]
            var lowerPath = fileHelpers.relativePath(userId, df.path_lower)
            if (lowerPath == fromPath.toLowerCase()) {
                toPath = this.toPath
            } else {
                var name = df.name
                var relativePath = lowerPath.substring(fromPath.length, lowerPath.length)
                var toPath = path.join(rootPath, relativePath)
                toPath = path.join(path.dirname(toPath), name)
            }
            yield this._moveFile(df, toPath)
        }
    }
    /**
     * Move file or folder 
     * @return {Object}    
     * @api public
     */
MiniMoveFile.prototype.move = function*() {
        var userId = this.device.user_id
            //tofile existed,autorename tofile name 
        var toPath = this.toPath
        var toFile = yield getFileByPath(userId, toPath)
        var toName = path.basename(toPath)
        if (toFile) {
            toPath = yield fileHelpers.getNumberFileName(toFile, toName, 1)
        }
        this.toPath = toPath
        var fromPath = this.fromPath
        var fromFile = yield getFileByPath(userId, fromPath)
        if (fromFile.type === 0) {
            //copy file
            yield this._moveFile(fromFile)
        }
        if (fromFile.type === 1) {
            //copy folder
            yield this._moveFolder()
        }
    }
    /*
     * Move One file or folder
     * @param {Object} fromFile 
     * @param {String} toFilePath 
     * @return {Object}    
     * @api private
     */
MiniMoveFile.prototype._moveFile = function*(fromFile, toFilePath) {
        var device = this.device
        var userId = device.user_id
        var toFilePath = toFilePath || this.toPath
            //create to file parent file
        var toFileParentPath = path.dirname(toFilePath)
        var toName = path.basename(toFilePath)
        var toFileParent = yield createFolder(device, toFileParentPath)
        fromFile.parent_id = toFileParent.id
        fromFile.name = path.basename(toFilePath)
        fromFile.path_lower = fileHelpers.lowerPath(userId, toFilePath)
        yield fromFile.save()
    }
    /**
     * move file or folder
     * @param {Object} device 
     * @param {String} fromPath 
     * @param {String} toPath 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
var move = function*(device, fromPath, toPath, options) {
    var MiniMove = new MiniMoveFile(device, fromPath, toPath, options)
    return yield MiniMove.move()
}
exports.move = move
