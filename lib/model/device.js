'use strict'
/**
 * database table minicloud_devices CRUD
 */
/**
 * Module dependencies.
 */
var deviceModel = sequelizePool.deviceModel
var md5 = require('md5')
var co = require('co')
var helpers = require('../helpers')
    //set hook
deviceModel.hook('beforeDestroy', function(device, options) {
        var MiniOnlineDevice = require('./online-device') 
        var MiniToken = require('./oauth-access-token')
        var deviceId = device.id
        var userId = device.user_id
        var clientId = device.client_id
        co.wrap(function*() {
            yield MiniOnlineDevice.removeAllByDeviceId(deviceId) 
            yield MiniToken.remove(clientId, deviceId)
        })()
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
        var device = yield deviceModel.findOne({
            where: {
                uuid: deviceUuid
            }
        })
        if (!device) {
            if (global.oldVersion) {
                var deviceType = helpers.getDeviceTypeByClientId(clientId)
                var device = yield deviceModel.create({
                    user_id: user.id,
                    device_type: deviceType,
                    client_id: clientId,
                    name: deviceName,
                    info: deivceInfo,
                    uuid: deviceUuid
                })
            } else {
                var device = yield deviceModel.create({
                    user_id: user.id,
                    client_id: clientId,
                    name: deviceName,
                    info: deivceInfo,
                    uuid: deviceUuid
                })
            }
        } else {
            device = yield device.save()
        }
        return device
    }
    /**
    * Get devices for the current user
    
    * @param {Object} userId
    * @return [array]  
    */
exports.getAllByUserId = function*(userId) {
        return yield deviceModel.findAll({
            where: {
                user_id: userId
            }
        })
    }
    /**
     * Get devices 
     * @param {Object} userIds
     * @param {Integer} limit
     * @param {String} cursor
     * @return [array]  
     */
exports.getDevices = function*(userIds, limit, cursor) {
        var order = 'id asc'
        var conditons = {}
        conditons.user_id = {
            $in: userIds
        }
        return yield helpers.simplePage(deviceModel, conditons, limit, cursor, order)
    }
    /**
     * Get deviceId    
     * @param {string} uuid
     * @return {string}  
     */
exports.getById = function*(id) {
        return yield deviceModel.findById(id)
    }
    /**
     * Get deviceId    
     * @param {string} uuid
     * @return {string}  
     */
exports.getByUuid = function*(uuid) {
    return yield deviceModel.findOne({
        where: {
            uuid: uuid
        }
    })
}
