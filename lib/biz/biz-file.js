'use strict'
/**
 * file biz incloud:file create/update/delete/list
 */
var MiniFile = require('../model/file')
var MiniVersion = require('../model/version')
var BizUserMeta = require('./biz-user-meta')
var path = require('path')
var mime = require('mime')
    /**
     * return have over space
     * @param {Integer} userId
     * @param {Integer} newFileSize
     * @return {Boolean}  
     * @api public
     */
exports.isOverSpace = function*(userId, newFileSize) {
        var usedSpaceSize = yield MiniFile.getUsedSpaceSize(userId)
        var spaceSize = yield BizUserMeta.getSpaceSize(userId)
        return usedSpaceSize + newFileSize > spaceSize
    }
    /**
     * hash upload file
     * @param {Object} device
     * @param {String} filePath 
     * @param {Object} version
     * @param {Object} options
     * @return {Object}  
     * @api public
     */
exports.hashUpload = function*(device, filePath, version, options) {
    var file = yield MiniFile.createFile(device, filePath, version, options) 
    return yield MiniFile.getFullFile(file)
}
