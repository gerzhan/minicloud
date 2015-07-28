'use strict'
    /**
     * database table miniyun_log CRUD
     */
var eventModel = dbPool.eventModel
var helper = require("../helper")
    /**
     * find login logs by userId
     * @param {Integer} userId 
     * @return {Object}
     * @api public
     */
exports.getById = function*(userId) {
    var loginEvents = yield eventModel.coFind({
        user_id: userId
    })
    if (loginEvents.length > 0) {
        return loginEvents
    }
    return null;
}

    /**
     * Create log 
     * @param {Integer} type  
     * @param {Integer} userId 
     * @param {Integer} deviceId  
     * @param {Integer} action  
     * @param {String} context
     * @return {Object}    
     * @api public
     */
exports.create = function*(type,userId,deviceId,action,context) {
    var uuid = null
    var path = null
    var logList = yield eventModel.coFind({
        user_id: userId
    })
    if (logList.length == 0) {
        var log = yield eventModel.coCreate({
            uuid: uuid,
            type: type,
            user_id: userId,
            device_id: deviceId,
            action: action,
            path: path,
            context: context
        })
    } else {
        var log = logList[0]
        log.uuid = uuid
        log.type = type
        log.user_id = userId
        log.device_id = deviceId
        log.action = action
        log.path = path
        log.context = context
        log = yield log.coSave();
    }
    return log
}

    /**
     * clean log events
     * @param {Integer} userId 
     * @param {Integer} type
     * @api public
     */
exports.cleanLoginEvents = function*(userId,type) {
    var oldVersion = global.oldVersion
    var tablePrefix = global.tablePrefix
    var db = global.dbPool.db
    var sql = "DELETE FROM " + tablePrefix + "events WHERE user_id=? and type=?"
    yield db.coExecQuery(sql, [userId,type])
}
