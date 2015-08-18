'use strict'
/**
 * file biz incloud:file create/update/delete/list
 */
var MiniFile = require('../model/file')
var MiniVersion = require('../model/version')
var BizUserMeta = require('./biz-user-meta')
var path = require('path')
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
     * @param {Integer} userId
     * @param {Object} version
     * @param {String} filePath
     * @param {Boolean} autorename
     * @param {Timestamp} clientModified
     * @return {Boolean}  
     * @api public
     */
exports.hashUpload = function*(userId, filePath, autorename, clientModified, version) {
    if (clientModified) {
        clientModified = new Date()
    }
    var fileName = path.basename(filePath)
    var mime = 'doc'
    yield MiniFile.create(userId, 0, new Date(), clientModified, fileName, version.id, version.size, filePath.toLowerCase(), false, mime)
    yield MiniVersion.addRefCount(version.id)
}
