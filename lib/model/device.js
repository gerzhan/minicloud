'use strict'
/**
 * database table miniyun_devices CRUD
 */
 /**
 * Module dependencies.
 */
var deviceModel = dbPool.deviceModel 
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
    var deivceInfo = appKey + "_" + user.name + "_" + deviceName
    var deviceUuid = md5(deivceInfo)
    var deviceList = yield deviceModel.coFind({
        uuid: deviceUuid
    })
    if (deviceList.length == 0) {
        var device = yield deviceModel.coCreate({
            user_id: user.id,
            type: deviceType,
            name: deviceName,
            info: deivceInfo,
            uuid: deviceUuid
        })
    } else {
        var device = deviceList[0]
        device = yield device.coSave()
    }
    return device
}
