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

        var deivceInfo = appKey + "_" + user.name + "_" + deviceName
        var deviceUuid = md5(deivceInfo)
        var deviceList = yield deviceModel.coFind({
            uuid: deviceUuid
        })
        if (deviceList.length == 0) {
            if (global.oldVersion) {
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
                var device = yield deviceModel.coCreate({
                    user_id: user.id,
                    device_type: deviceType,
                    client_id: appKey,
                    name: deviceName,
                    info: deivceInfo,
                    uuid: deviceUuid
                })
            } else {
                var device = yield deviceModel.coCreate({
                    user_id: user.id,
                    client_id: appKey,
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
exports.getByUuid = function*(uuid) {
        var deviceList = yield deviceModel.coFind({
            uuid: uuid
        })
        if (deviceList.length > 0) {
            return deviceList[0]
        }
        return null
    }
    /**
    * remove one device    
    * @param {string} uuid       
    */
exports.removeAllByUuid = function*(uuid) {

    var oldVersion = global.oldVersion
    var tablePrefix = global.tablePrefix
    var db = global.dbPool.db
    if (oldVersion) {
        var sql = "DELETE FROM " + tablePrefix + "user_devices WHERE user_device_uuid=?"
    } else {
        var sql = "DELETE FROM " + tablePrefix + "devices WHERE uuid=?"
    }

    yield db.coExecQuery(sql, [uuid])

}
