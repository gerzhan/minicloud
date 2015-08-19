'use strict'
var path = require('path')
var S = require('string')
var co = require('co')
var pinyin = require('pinyin')
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
        var newPath = PATH_SEP
        for (var i = 0; i < newSubFiles.length; i++) {
            newPath += newSubFiles[i] + PATH_SEP
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
     * @param {Object} version 
     * @param {String} filePath 
     * @param {TimeStamp} clientModified  
     * @return {Object}    
     * @api public
     */
exports.createFile = function*(userId, version, filePath, clientModified) {
        var fileName = path.basename(filePath)
        var file = yield getByPath(userId, filePath)
        if (file) {
            if (file.version_id == version.id) {
                //update file name
                file.name = fileName
                file = yield file.save()
            } else {
                //update file
            }
        }
    }
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
