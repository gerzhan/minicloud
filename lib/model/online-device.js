'use strict'
/**
 * database table minicloud_online_device CRUD
 */
var onlineDeviceModel = sequelizePool.onlineDeviceModel
var helpers = require('../helpers')
var MiniUser = require('./user')
var MiniDevice = require('./device')
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
    var deviceOnline = null
    if (!onlineDevice) {
        deviceOnline = yield onlineDeviceModel.create({
            user_id: userId,
            device_id: deviceId,
            client_id: clientId
        })
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
    /**
     * dataobject convert to view object 
     * @param {Object} device  
     * @return {Object}   
     * @api private
     */
var _do2vo = function*(onlineDevice) {
        var data = null
        var device = yield MiniDevice.getById(onlineDevice.device_id)
        if (device) {
            var userName = ''
            var user = yield MiniUser.getById(device.user_id)
            if (user) {
                userName = user.name
            }
            data = {
                client_id: device.client_id,
                uuid: device.uuid,
                device_name: device.name,
                user_name: userName,
                updated_at: device.updated_at
            }
        }
        return data
    }
    /**
     * page list convert to view object page list
     * @param {Object} page  
     * @return {Object}   
     * @api private
     */
var _list2vo = function*(page) {
        //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor,
            count: page.count
        }
        var devices = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            if (item) {
                devices.push(yield _do2vo(item))
            }
        }
        data.devices = devices
        return data
    }
    /**
     * Get online devices 
     * @param {Object} userIds
     * @param {Integer} limit
     * @param {String} cursor
     * @return [array]  
     */
exports.getOnlineDevices = function*(userIds, limit, cursor) {
    var order = 'id asc'
    var conditons = {}
    conditons.user_id = {
        $in: userIds
    }
    var page = yield helpers.simplePage(onlineDeviceModel, conditons, limit, cursor, order)
    return yield _list2vo(page)
}
