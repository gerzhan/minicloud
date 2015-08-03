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
 * @param {integer} deviceId
 * @api public
 */

exports.removeAllByDeviceId = function*(deviceId) {
    yield onlineDevice.find({
        device_id: deviceId
    }).remove().coRun()
}


/**
 * get all online device list
 * @param {integer} deviceId
 * @api public
 */
exports.getAllDeviceId = function*(deviceId) {
    var onlineDeviceList = yield onlineDevice.coFind({
        device_id: deviceId
    })
    return onlineDeviceList
}
