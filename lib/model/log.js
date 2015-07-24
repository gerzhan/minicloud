'use strict'
    /**
     * database table miniyun_log CRUD
     */
var logModel = dbPool.logModel
var helper = require("../helper")
    /**
     * find login logs by userId
     * @param {Integer} userId 
     * @return {Object}
     * @api public
     */
exports.getById = function*(userId) {
    var loginEvents = yield logModel.coFind({
        user_id: userId
    })
    if (loginEvents.length > 0) {
        return loginEvents
    }
    return null;
}

    /**
     * Create log 
     * @param {Integer} userId 
     * @param {Integer} type  
     * @param {String} name  
     * @param {String} message  
     * @param {String} context  
     * @param {Boolean} isDelete  
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, type, name, message, context, isDelete) {
    var logList = yield logModel.coFind({
        user_id: userId
    })
    if (logList.length == 0) {
        var log = yield logModel.coCreate({
            user_id: userId,
            type: type,
            name: name,
            message: message,
            context: context,
            is_delete: isDelete
        })
    } else {
        var log = logList[0]
        log.user_id = userId
        log.type = type
        log.name = name
        log.message = message
        log.context = context
        log.is_delete = isDelete
        log = yield log.coSave();
    }
    return log
}
