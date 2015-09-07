var path = require('path')
var fileHelpers = require('../file-helpers')
var MiniFileCore = require('./file-core').MiniFileCore
var miniFileCore = new MiniFileCore()
    /**
     * Move file or folder
     * @param {Object} device 
     * @param {String} fromPath 
     * @param {String} toPath 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
function MiniMoveFile(device, fromPath, toPath, options) {
    options = options || {}
    options.device = device
    options.ip = options.ip || '127.0.0.1'
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
            var newFile = yield this._moveFile(df, toPath)
            if (lowerPath == fromPath.toLowerCase()) {
                rootFile = newFile
            }
        }
        return rootFile
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
        var toFile = yield miniFileCore.getFileByPath(userId, toPath)
        var toName = path.basename(toPath)
        if (toFile) {
            toPath = yield fileHelpers.getNumberFileName(toFile, toName, 1)
        }
        this.toPath = toPath
        var fromPath = this.fromPath
        var fromFile = yield miniFileCore.getFileByPath(userId, fromPath)
        if (fromFile.type === 0) {
            //move file
            return yield this._moveFile(fromFile)
        }
        if (fromFile.type === 1) {
            //move folder
            return yield this._moveFolder()
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
    var toFileParent = yield miniFileCore.createFolder(device, toFileParentPath)
    fromFile.parent_id = toFileParent.id
    fromFile.name = path.basename(toFilePath)
    fromFile.path_lower = fileHelpers.lowerPath(userId, toFilePath)
    return yield fromFile.save({
        context: this.options
    })
}
exports.MiniMoveFile = MiniMoveFile