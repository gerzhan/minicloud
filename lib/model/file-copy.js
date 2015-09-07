var path = require('path')
var fileHelpers = require('../file-helpers')
var MiniVersion = require('./version')
var MiniFileCore = require('./file-core').MiniFileCore
var miniFileCore = new MiniFileCore()
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel
    /**
     * Copy file or folder
     * @param {Object} device 
     * @param {String} fromPath 
     * @param {String} toPath 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
function MiniCopyFile(device, fromPath, toPath, options) {
    options = options || {}
    this.device = device
    this.fromPath = fileHelpers.normalizePath(fromPath)
    this.toPath = fileHelpers.normalizePath(toPath)
    this.options = options
    this.options.device = device
    this.options.ip = options.ip || '127.0.0.1'
}
/**
 * Copy folder   
 * @return {Object}    
 * @api private
 */
MiniCopyFile.prototype._copyFolder = function*() {
        var userId = this.device.user_id
        var fromPath = this.fromPath
        var files = yield miniFileCore.getDescendantsByPath(userId, fromPath)
        var rootPath = this.toPath
        var rootFile = null
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
            var newFile = yield this._copyFile(df, toPath)
            if (lowerPath == fromPath.toLowerCase()) {
                rootFile = newFile
            }
        }
        return rootFile
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
        var toFile = yield miniFileCore.getFileByPath(userId, toPath)
        var toName = path.basename(toPath)
        if (toFile) {
            toPath = yield fileHelpers.getNumberFileName(toFile, toName, 1)
        }
        this.toPath = toPath
        var fromPath = this.fromPath
        var fromFile = yield miniFileCore.getFileByPath(userId, fromPath)
        if (fromFile.type === 0) {
            //copy file
            return yield this._copyFile(fromFile)
        }
        if (fromFile.type === 1) {
            //copy folder
            return yield this._copyFolder()
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
    var toFileParent = yield miniFileCore.createFolder(device, toFileParentPath)
    var options = this.options
    if (fromFile.type === 0) {
        //copy one file
        var version = yield MiniVersion.getById(fromFile.version_id)
        options.version = version
        return yield fileModel.create({
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
            context: options
        })
    }
    if (fromFile.type === 1) {
        //copy one folder 
        return yield fileModel.create({
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
            context: options
        })
    }
}
exports.MiniCopyFile = MiniCopyFile
