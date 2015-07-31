'use strict'
/**
 * database table miniyun_online_device CRUD
 */
var onlineDevice = dbPool.onlineDeviceModel
var helpers = require("../helpers")
    /**
     * Create onlineDevice
     * 
     * @param {integer} userId
     * @param {integer} deviceId
     * @param {integer} clientId       
     * @return {Object}  
     * @api public
     */
exports.create = function*(userId, deviceId, clientId) {
    if (global.oldVersion) {
        var deviceType = helpers.getDeviceTypeByClientId(clientId)

        var deviceOnline = yield onlineDevice.coCreate({
            user_id: userId,
            device_id: deviceId,
            client_id: clientId,
            device_type: deviceType
        })
    } else {
        var deviceOnline = yield onlineDevice.coCreate({
            user_id: userId,
            device_id: deviceId,
            client_id: clientId
        })
    }

    return deviceOnline
}

/**
 * remove OnlineDevice
 * @param {integer} device_id
 * @api public
 */

exports.removeAllByDeviceId = function*(deviceId) {
    var oldVersion = global.oldVersion
    var tablePrefix = global.tablePrefix
    var db = global.dbPool.db
    if (oldVersion) {
        var sql = "DELETE FROM " + tablePrefix + "online_devices WHERE device_id=?"
    } else {
        var sql = "DELETE FROM " + tablePrefix + "online_devices WHERE device_id=?"
    }
    yield db.coExecQuery(sql, [deviceId])
}
