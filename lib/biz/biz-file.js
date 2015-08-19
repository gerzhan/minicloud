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
     * @param {Integer} userId
     * @param {Object} version
     * @param {String} filePath
     * @param {Boolean} autorename
     * @param {Timestamp} clientModified
     * @return {Boolean}  
     * @api public
     */
exports.hashUpload = function*(userId, filePath, autorename, clientModified, version) {
    yield MiniFile.createFile(userId, filePath, version, clientModified)
    yield MiniVersion.addRefCount(version.id)
}
