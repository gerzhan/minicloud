var MiniFileMeta = require('./file-meta')
var fileModel = sequelizePool.fileModel
var MiniVersion = require('./version')
var fileHelpers = require('../file-helpers')
var PATH_SEP = '/'
var path = require('path')
    /**
     * Conflict file
     * option.mode add:It's always a conflict. The autorename strategy is to append a number to the file name. For example "document.txt" might become "document (2).txt". overwrite:It's never a conflict. Overwrite the existing file. The autorename strategy is the same as it is for add. update:It's a conflict only if the current "hash" doesn't match the given "hash". The autorename strategy is to append the string "conflicted copy" to the file name. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt".
     * @param {device} device 
     * @param {Object} file 
     * @param {Object} newFilePath 
     * @param {Object} version 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
function ConflictFile(device, file, newFilePath, version, options) {
    options = options || {}
    this.device = device
    this.file = file
    this.newFilePath = newFilePath
    this.version = version
    this.mode = options.mode || 'overwrite'
    this.options = options
}
/**
 * By mode,Conflict file bisiness   
 * @return {Object}    
 * @api private
 */
ConflictFile.prototype.run = function*() {
        if (this.mode === 'add') {
            return yield this.add()
        }
        if (this.mode === 'overwrite') {
            return yield this.overwrite()
        }
        if (this.mode === 'update') {
            return yield this.update()
        }
    }
    /**
     * return number file name 
     * @param {Object} existedFile
     * @param {String} fileName
     * @param {Integer} number
     * @return {Object}    
     * @api private
     */
ConflictFile.prototype.getNumberFileName = function*(existedFile, fileName, number) {
        var ext = path.extname(fileName)
        var basename = path.basename(fileName, ext)
        var newFileName = basename + ' (' + number + ')' + ext
        var parentId = existedFile.parent_id
        var userId = existedFile.user_id
            //set default root path
        var relativePath = PATH_SEP + newFileName
        var parentFile = yield fileModel.findById(parentId)
        if (parentFile) {
            relativePath = fileHelpers.relativePath(userId, parentFile.path_lower) + PATH_SEP + newFileName
        }
        var count = yield fileModel.count({
            where: {
                user_id: userId,
                path_lower: fileHelpers.lowerPath(userId, relativePath)
            }
        })
        if (count > 0) {
            number++
            return yield this.getNumberFileName(existedFile, fileName, number)
        }
        return relativePath
    }
    /**
     * It's always a conflict. The autorename strategy is to append a number to the file name. For example "document.txt" might become "document (2).txt"  
     * @return {Object}    
     * @api private
     */
ConflictFile.prototype.add = function*() {
        var userId = this.file.user_id
        var readyFileName = path.basename(this.newFilePath)
        var relativePath = yield this.getNumberFileName(this.file, readyFileName, 1)
        var newFileName = path.basename(relativePath)
        var clientModified = this.options.clientModified || new Date().getTime()
            //create file
        var file = yield fileModel.create({
            user_id: userId,
            type: 0,
            client_created: new Date().getTime(),
            client_modified: clientModified,
            name: newFileName,
            version_id: this.version.id,
            size: this.version.size,
            parent_id: this.file.parent_id,
            path_lower: fileHelpers.lowerPath(userId, relativePath),
            is_deleted: 0,
            mime: fileHelpers.getMime(newFileName)
        }, {
            device: this.device,
            version: this.version
        })
        return file
    }
    /**
     * It's never a conflict. Overwrite the existing file. The autorename strategy is the same as it is for add.  
     * @return {Object}    
     * @api private
     */
ConflictFile.prototype.overwrite = function*() {
        var file = this.file
        var version = this.version
            //create history version 
        yield MiniFileMeta.addVersion(file, version, this.device)
            //set new version
        file.name = path.basename(this.newFilePath)
        var clientModified = this.options.clientModified || new Date().getTime()
        file.client_modified = clientModified
        file.version_id = version.id
        file.size = version.size
        file = yield file.save()
        return file
    }
    /**
     * return conflict file name 
     * @param {Object} existedFile
     * @param {String} fileName
     * @param {Integer} number
     * @return {Object}    
     * @api private
     */
ConflictFile.prototype.getConflictFileName = function*(existedFile, fileName, number) {
        var ext = path.extname(fileName)
        var basename = path.basename(fileName, ext)
        var newFileName = basename + ' (conflicted copy)'
        if (number > 0) {
            newFileName += '(' + number + ')'
        }
        newFileName += ext
        var parentId = existedFile.parent_id
        var userId = existedFile.user_id
            //set default root path
        var relativePath = PATH_SEP + newFileName
        var parentFile = yield fileModel.findById(parentId)
        if (parentFile) {
            relativePath = fileHelpers.relativePath(userId, parentFile.path_lower) + PATH_SEP + newFileName
        }
        var count = yield fileModel.count({
            where: {
                user_id: userId,
                path_lower: fileHelpers.lowerPath(userId, relativePath)
            }
        })
        if (count > 0) {
            number++
            return yield this.getConflictFileName(existedFile, fileName, number)
        }
        return relativePath
    }
    /**
     * It's a conflict only if the current "hash" doesn't match the given "hash". The autorename strategy is to append the string "conflicted copy" to the file name. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt". 
     * @return {Object}    
     * @api public
     */
ConflictFile.prototype.update = function*() {
    var parentHash = this.options.parent_hash
    var parentVersion = yield MiniVersion.getById(this.file.version_id)
    if (parentVersion.hash === parentHash) {
        return yield this.overwrite()
    }
    var userId = this.file.user_id
    var readyFileName = path.basename(this.newFilePath)
    var relativePath = yield this.getConflictFileName(this.file, readyFileName, 0)
    var newFileName = path.basename(relativePath)
    var clientModified = this.options.clientModified || new Date().getTime()
        //create file
    var file = yield fileModel.create({
        user_id: userId,
        type: 0,
        client_created: new Date().getTime(),
        client_modified: clientModified,
        name: newFileName,
        version_id: this.version.id,
        size: this.version.size,
        parent_id: this.file.parent_id,
        path_lower: fileHelpers.lowerPath(userId, relativePath),
        is_deleted: 0,
        mime: fileHelpers.getMime(newFileName)
    }, {
        device: this.device,
        version: this.version
    })
    return file
}
exports.ConflictFile = ConflictFile
