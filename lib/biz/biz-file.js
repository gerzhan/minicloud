'use strict'
/**
 * file biz incloud:file create/update/delete/list
 */
var MiniFile = require('../model/file')
var MiniVersion = require('../model/version')
var MiniFileUploadSession = require('../model/file-upload-session')
var BizUserMeta = require('./biz-user-meta')
var md5 = require('md5')
    /**
     * return have over space
     * @param {Integer} userId
     * @param {Integer} newFileSize
     * @return {Boolean}  
     * @api public
     */
var isOverSpace = function*(userId, newFileSize) {
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
var hashUpload = function*(device, filePath, version, options) {
        var file = yield MiniFile.createFile(device, filePath, version, options)
        return yield MiniFile.getFullFile(file)
    }
    /**
     * create upload session
     * @return {Object}  
     * @api public
     */
var createUploadSession = function*(storeNode) {
    var storeServerId = storeNode.id || -1
    var safeCode = storeNode.safe_code || global.appContext.storage.safe_code
    var host = storeNode.host
    var session = yield MiniFileUploadSession.create(storeServerId)
    var sessionId = session.session_id
    var date = new Date()
    var time = date.getTime()
    var signature = md5(sessionId + time + safeCode) 
    return {
        store_host: host,
        session_id: sessionId,
        time: time,
        signature: signature
    }
}
exports.isOverSpace = isOverSpace
exports.hashUpload = hashUpload
exports.createUploadSession = createUploadSession
