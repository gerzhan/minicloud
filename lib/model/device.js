'use strict'
/**
 * database table miniyun_devices CRUD
 */
/**
 * Module dependencies.
 */
var deviceModel = dbPool.deviceModel
var md5 = require('md5')
var co = require('co')
var helpers = require('../helpers')
    //set hook
deviceModel.beforeRemove(function(next) {
        var miniOnlineDevice = require('./online-device')
        var miniEvent = require('./event')
        var deviceId = this.id
        co.wrap(function*() {
            yield miniOnlineDevice.removeAllByDeviceId(deviceId)
            yield miniEvent.removeAllByDeviceId(deviceId)
        })()
        return next()
    })
    /**
     * Create device
     * 
     * @param {Object} user
     * @param {String} deviceName  
     * @param {String} clientId  
     * @return {Object}   
     * @api public
     */
exports.create = function*(user, deviceName, clientId) {

        var deivceInfo = clientId + '_' + user.name + '_' + deviceName
        var deviceUuid = md5(deivceInfo)
        var deviceList = yield deviceModel.coFind({
            uuid: deviceUuid
        })
        if (deviceList.length == 0) {
            if (global.oldVersion) {
                var deviceType = helpers.getDeviceTypeByClientId(clientId)
                var device = yield deviceModel.coCreate({
                    user_id: user.id,
                    device_type: deviceType,
                    client_id: clientId,
                    name: deviceName,
                    info: deivceInfo,
                    uuid: deviceUuid
                })
            } else {
                var device = yield deviceModel.coCreate({
                    user_id: user.id,
                    client_id: clientId,
                    name: deviceName,
                    info: deivceInfo,
                    uuid: deviceUuid
                })
            }
        } else {
            var device = deviceList[0]
            device = yield device.coSave()
        }
        return device
    }
    /**
    * Get devices for the current user
    
    * @param {Object} userId
    * @return [array]  
    */
exports.getAllByUserId = function*(userId) {
        var deviceList = yield deviceModel.coFind({
            user_id: userId
        })
        if (deviceList.length > 0) {
            return deviceList
        }
        return null
    }
    /**
     * Get deviceId    
     * @param {string} uuid
     * @return {string}  
     */
exports.getById = function*(id) {
        var deviceList = yield deviceModel.coFind({
            id: id
        })
        if (deviceList.length > 0) {
            return deviceList[0]
        }
        return null
    }
    /**
     * Get deviceId    
     * @param {string} uuid
     * @return {string}  
     */
exports.getByUuid = function*(uuid) {
    var deviceList = yield deviceModel.coFind({
        uuid: uuid
    })
    if (deviceList.length > 0) {
        return deviceList[0]
    }
    return null
}
