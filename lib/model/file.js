'use strict'
var MiniFileCore = require('./file-core').MiniFileCore
var miniFileCore = new MiniFileCore()
var HookFile = require('./hook-file')
    //add hook
HookFile.run()
    /**
     * Create file
     * @param {Object} device 
     * @param {String} filePath 
     * @param {Object} version 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
exports.createFile = function*(device, filePath, version, options) {
        return yield miniFileCore.createFile(device, filePath, version, options)
    }
    /**
     * Create folder 
     * @param {Object} device 
     * @param {String} filePath  
     * @return {Object}    
     * @api private
     */
exports.createFolder = function*(device, filePath, options) { 
        return yield miniFileCore.createFolder(device, filePath, options)
    }
    /**
     * find file by id
     * @param {Integer} id 
     * @return {Object}
     * @api public
     */
exports.getById = function*(id) {
        return yield miniFileCore.getById(id)
    }
    /**
     * return used size
     * @param {Integer} userId 
     * @return BigInt
     * @api public
     */
exports.getUsedSpaceSize = function*(userId) {
        return yield miniFileCore.getUsedSpaceSize(userId)
    }
    /**
     * return file by path
     * @param {Integer} userId 
     * @param {String} filePath  
     * @return {Object}    
     * @api public

     */
exports.getByPath = function*(userId, filePath) {
        return yield miniFileCore.getFileByPath(userId, filePath)
    }
    /**
     * get full file
     * @param {Object} file  
     * @api public
     */
exports.getFullFile = function*(file) {
        return yield miniFileCore.getFullFile(file)
    }
    /**
     * delete  file
     * @param {Object} device 
     * @param {String} filePath  
     * @param {Object} options  
     * @api public
     */
exports.fakeDeleteFile = function*(device, filePath, options) {
        return yield miniFileCore.fakeDeleteFile(device, filePath, options)
    }
    /**
     * return subfile and subfolder list by path
     * @param {Integer} userId 
     * @param {String} filePath  
     * @return [Array]    
     * @api public
     */
exports.getDescendantsByPath = function*(userId, filePath) {
    return yield miniFileCore.getDescendantsByPath(userId, filePath)
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
exports.copy = function*(device, fromPath, toPath, options) {
    var MiniCopyFile = require('./file-copy').MiniCopyFile
    var miniCopyFile = new MiniCopyFile(device, fromPath, toPath, options)
    return yield miniCopyFile.copy()
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
exports.move = function*(device, fromPath, toPath, options) { 
    var MiniMoveFile = require('./file-move').MiniMoveFile
    var miniMoveFile = new MiniMoveFile(device, fromPath, toPath, options) 
    return yield miniMoveFile.move()
}
