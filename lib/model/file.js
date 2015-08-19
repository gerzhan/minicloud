'use strict'
var path = require('path')
var S = require('string')
var co = require('co')
var pinyin = require('pinyin')
var mime = require('mime')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel
var PATH_SEP = '/'
var FILE_NAME_KEY = '_'
    /**
     * return normalize fileName 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var normalizeFileName = function(fileName) {
        var sKeys = [':', '\\', ':', '*', '?', '"', '<', '>', '|']
        for (var i = 0; i < sKeys.length; i++) {
            fileName = S(fileName).replaceAll(sKeys[i], FILE_NAME_KEY).s
        }
        return fileName
    }
    /**
     * return normalize path 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var normalizePath = function(filePath) {
        filePath = path.normalize(filePath)
        var subFiles = filePath.split(PATH_SEP)
        var newSubFiles = []
        for (var i = 0; i < subFiles.length; i++) {
            var subFileName = subFiles[i]
            if (subFileName !== '') {
                subFileName = normalizeFileName(subFileName)
                newSubFiles.push(subFileName)
            }
        }
        var newPath = ''
        for (var i = 0; i < newSubFiles.length; i++) {
            newPath += PATH_SEP + newSubFiles[i]
        }
        return newPath
    }
    /**
     * return lower path 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var lowerPath = function(userId, filePath) {
        filePath = normalizePath(filePath)
        if (filePath.length > 1) {
            var lastChar = filePath.substring(filePath.length - 1, filePath.length)
            if (lastChar === PATH_SEP) {
                filePath = filePath.substring(0, filePath.length - 1)
            }
        }
        var absolutePath = PATH_SEP + userId + filePath
        return absolutePath.toLowerCase()
    }
    /**
     * return relative path 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var relativePath = function(userId, dbFilePath) {
        var prefix = PATH_SEP + userId
        var newPath = dbFilePath.substring(prefix.length, dbFilePath.length)
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
                path_lower: lowerPath(userId, filePath)
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
        if (subFolders.length === 0) {
            return parentFile
        }
        var parentFolderId = -1
        var parentFolderPath = ''
        if (parentFile) {
            parentFolderId = parentFile.id
            parentFolderPath = relativePath(userId, parentFile.path_lower)
        }
        //create child folder
        var childFolderName = subFolders[0]
        if (childFolderName === '') {
            return parentFile
        }
        //normalize file name
        childFolderName = normalizeFileName(childFolderName)
        var childFolderPath = parentFolderPath + PATH_SEP + childFolderName
        var childFolderFile = yield getFileByPath(userId, childFolderPath)
        if (!childFolderFile) {
            //create folder
            childFolderFile = yield fileModel.create({
                user_id: userId,
                type: 1,
                client_created_at: new Date().getTime(),
                client_modified_at: new Date().getTime(),
                name: childFolderName,
                version_id: 0,
                size: 0,
                parent_id: parentFolderId,
                path_lower: lowerPath(userId, childFolderPath),
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
        filePath = normalizePath(filePath)
        var subFolders = filePath.split(PATH_SEP)
        subFolders = subFolders.slice(1, subFolders.length)
        file = yield recursiveCreateFolder(userId, null, subFolders)
    }
    return file
}
exports.createFolder = createFolder
exports.getByPath = getFileByPath
    // set hook
var updatePinyin = function*(file) {
        var name = file.name
        name = name.toLowerCase()
        var nameQuanPin = pinyin(name, {
            style: pinyin.STYLE_NORMAL
        })
        var nameJianPin = pinyin(name, {
                style: pinyin.STYLE_FIRST_LETTER
            })
            //get name pinyin
        var pinyinDetail = S(nameQuanPin).replaceAll(',', '').s + '|' + S(nameJianPin).replaceAll(',', '').s
        file.file_name_pinyin = pinyinDetail
    }
    //set hook
fileModel.hook('beforeCreate', function(file, options) {
        co.wrap(function*() {
            yield updatePinyin(file)
        })()
    })
    //set hook
fileModel.hook('beforeUpdate', function(file, options) {
        co.wrap(function*() {
            yield updatePinyin(file)
        })()
    })
    /**
     * Create file
     * @param {Integer} userId 
     * @param {String} filePath 
     * @param {Object} version 
     * @param {TimeStamp} clientModified  
     * @return {Object}    
     * @api public
     */
exports.createFile = function*(userId, filePath, version, clientModified) {
    filePath = normalizePath(filePath)
    var fileName = path.basename(filePath)
    var file = yield getFileByPath(userId, filePath)
    if (file) {
        if (file.version_id == version.id) {
            //update file name
            file.name = fileName
            return yield file.save()
        } else {
            //update file
        }
    }
    //create parent file
    var parentId = -1
    var parentPath = path.dirname(filePath)
    var parentFolder = yield createFolder(userId, parentPath)
    if (parentFolder) {
        parentId = parentFolder.id
    }
    if (!clientModified) {
        clientModified = new Date().getTime()
    }
    //set mime type
    var mimeType = mime.lookup(filePath)
        //create file
    return yield fileModel.create({
        user_id: userId,
        type: 0,
        client_created_at: new Date().getTime(),
        client_modified_at: clientModified,
        name: fileName,
        version_id: version.id,
        size: version.size,
        parent_id: parentId,
        path_lower: lowerPath(userId, filePath),
        is_deleted: 0,
        mime: mimeType
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
