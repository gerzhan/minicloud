'use strict'
/**
 * database table miniyun_online_device CRUD
 */
var onlineDevice = dbPool.onlineDeviceModel
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
        var deviceType = 1
        if (clientId == "d6n6Hy8CtSFEVqNh") {
            deviceType = 2
        }
        if (clientId == "c9Sxzc47pnmavzfy") {
            deviceType = 3
        }
        if (clientId == "MsUEu69sHtcDDeCp") {
            deviceType = 4
        }
        if (clientId == "V8G9svK8VDzezLum") {
            deviceType = 5
        }
        if (clientId == "Lt7hPcA6nuX38FY4") {
            deviceType = 6
        }
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
