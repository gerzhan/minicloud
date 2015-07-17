'use strict'
/**
 * database table miniyun_user_devices CRUD
 */
 /**
 * Module dependencies.
 */
var userDeviceModel = dbPool.userDeviceModel
var miniUtil = require("../mini-util")
var md5 = require('md5')
    /**
     * Create device
     * 
     * @param {Object} user
     * @param {String} deviceName  
     * @param {String} appKey  
     * @return {Object}   
     * @api public
     */
exports.create = function*(user, deviceName, appKey) {

    var deviceType = 1
    if (appKey == "d6n6Hy8CtSFEVqNh") {
        deviceType = 2
    }
    if (appKey == "c9Sxzc47pnmavzfy") {
        deviceType = 3
    }
    if (appKey == "MsUEu69sHtcDDeCp") {
        deviceType = 4
    }
    if (appKey == "V8G9svK8VDzezLum") {
        deviceType = 5
    }
    if (appKey == "Lt7hPcA6nuX38FY4") {
        deviceType = 6
    }
    var deivceInfo = appKey + "_" + user.user_name + "_" + deviceName
    var deviceUuid = md5(deivceInfo)
    var deviceList = yield userDeviceModel.coFind({
        user_device_uuid: deviceUuid
    })
    if (deviceList.length == 0) {
        var device = yield userDeviceModel.coCreate({
            user_id: user.id,
            user_device_type: deviceType,
            user_device_name: deviceName,
            user_device_info: deivceInfo,
            user_device_uuid: deviceUuid
        })
    } else {
        var device = deviceList[0]
        device = yield device.coSave()
    }
    return device
}
