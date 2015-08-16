'use strict'
/**
 * database table minicloud_online_device CRUD
 */
var onlineDeviceModel = sequelizePool.onlineDeviceModel
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
    var onlineDevice = yield onlineDeviceModel.findOne({
        device_id: deviceId
    })
    if (!onlineDevice) {
        if (global.oldVersion) {
            var deviceType = helpers.getDeviceTypeByClientId(clientId)
            var deviceOnline = yield onlineDeviceModel.create({
                user_id: userId,
                device_id: deviceId,
                client_id: clientId,
                device_type: deviceType
            })
        } else {
            // var deviceOnline = yield onlineDeviceModel.create({
            //     user_id: userId,
            //     device_id: deviceId,
            //     client_id: clientId
            // })
        }
    } else {
        //updated_at 
        onlineDevice = yield onlineDevice.save()
    }

    return deviceOnline
}

/**
 * remove OnlineDevice
 * @param {integer} deviceId
 * @api public
 */

exports.removeAllByDeviceId = function*(deviceId) {
        yield onlineDeviceModel.destroy({
            where: {
                device_id: deviceId
            }
        })
    }
    /**
     * get all online device list
     * @param {integer} deviceId
     * @api public
     */
exports.getAllDeviceId = function*(deviceId) {
    return yield onlineDeviceModel.findAll({
        device_id: deviceId
    }) 
}
