var path = require('path')
var S = require('string') 
var mime = require('mime')
    /**
     * return normalize fileName 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var normalizeFileName = function(fileName) {
        var FILE_NAME_KEY = '_'
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
     * return file's mimeType 
     * @param {String} filePath  
     * @return {String}    
     * @api private
     */
var getMime = function(filePath) {
        //set mime type
        return mime.lookup(filePath)
    }
    /**
     * return number file name 
     * @param {Object} existedFile
     * @param {String} fileName
     * @param {Integer} number
     * @return {Object}    
     * @api private
     */
var getNumberFileName = function*(existedFile, fileName, number) {
    var fileModel = sequelizePool.fileModel
    var ext = path.extname(fileName)
    var basename = path.basename(fileName, ext)
    var newFileName = basename + ' (' + number + ')' + ext
    var parentId = existedFile.parent_id
    var userId = existedFile.user_id
        //set default root path
    var rp = PATH_SEP + newFileName
    var parentFile = yield fileModel.findById(parentId) 
    if (parentFile) {
        rp = relativePath(userId, parentFile.path_lower) + PATH_SEP + newFileName
    }     
    var count = yield fileModel.count({
        where: {
            user_id: userId,
            path_lower: lowerPath(userId, rp)
        }
    })
    if (count > 0) {
        number++
        return yield getNumberFileName(existedFile, fileName, number)
    }
    return rp
}
exports.normalizePath = normalizePath
exports.relativePath = relativePath
exports.lowerPath = lowerPath
exports.getMime = getMime
exports.getNumberFileName = getNumberFileName
