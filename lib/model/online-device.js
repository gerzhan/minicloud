'use strict'
/**
 * database table minicloud_online_device CRUD
 */
var onlineDeviceModel = dbPool.onlineDeviceModel
var helpers = require('../helpers')
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
    var onlineDeviceList = yield onlineDeviceModel.coFind({
        device_id: deviceId
    })
    if (onlineDeviceList.length == 0) {
        if (global.oldVersion) {
            var deviceType = helpers.getDeviceTypeByClientId(clientId)
            var deviceOnline = yield onlineDeviceModel.coCreate({
                user_id: userId,
                device_id: deviceId,
                client_id: clientId,
                device_type: deviceType
            })
        }else{
            // var deviceOnline = yield onlineDeviceModel.coCreate({
            //     user_id: userId,
            //     device_id: deviceId,
            //     client_id: clientId
            // })
        }
    }else{
        //updated_at
        var onlineDevice = onlineDeviceList[0]
        onlineDevice = yield onlineDevice.coSave()
    }

    return deviceOnline
}

/**
 * remove OnlineDevice
 * @param {integer} deviceId
 * @api public
 */

exports.removeAllByDeviceId = function*(deviceId) {
    yield onlineDeviceModel.find({
        device_id: deviceId
    }).remove().coRun()
}


/**
 * get all online device list
 * @param {integer} deviceId
 * @api public
 */
exports.getAllDeviceId = function*(deviceId) {
    var onlineDeviceList = yield onlineDeviceModel.coFind({
        device_id: deviceId
    })
    return onlineDeviceList
}
