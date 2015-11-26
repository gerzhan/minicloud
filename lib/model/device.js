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
var MiniUser = require('./user')
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
            var device = yield deviceModel.create({
                user_id: user.id,
                client_id: clientId,
                name: deviceName,
                info: deivceInfo,
                uuid: deviceUuid
            })
        } else {
            device = yield device.save()
        }
        return device
    }
    /**
     * remove devices
     * @param {integer} userId
     * @api public
     */

exports.removeAllByUserId = function*(userId) {
        yield deviceModel.destroy({
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
        var page = yield helpers.simplePage(deviceModel, conditons, limit, cursor, order)
        return yield _list2vo(page)
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
     * dataobject convert to view object 
     * @param {Object} device  
     * @return {Object}   
     * @api private
     */
var _do2vo = function*(device) {
        var userName = ''
        var user = yield MiniUser.getById(device.user_id)
        if (user) {
            userName = user.name
        }
        return {
            client_id: device.client_id,
            uuid: device.uuid,
            device_name: device.name,
            user_name: userName,
            updated_at: device.updated_at
        }
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
            devices.push(yield _do2vo(item))
        }
        data.devices = devices
        return data
    }
    /**
     * return current user's devices
     * @param {String} key
     * @param {Integer} limit
     * @param {String} cursor
     * @return {Object}   
     * @api private
     */
var _simplePageDevice = function*(userId, limit, cursor) {
        var order = 'id asc'
        var conditons = {
                user_id: userId
            }
            //pagination
        var page = yield helpers.simplePage(deviceModel, conditons, limit, cursor, order)
        return yield _list2vo(page)
    }
    /**
     * Get devices list 
     * @param {Integer} limit
     * @param {String} cursor
     * @return {Object}   
     * @api public
     */
exports.list = function*(userId, limit, cursor) {
    return yield _simplePageDevice(userId, limit, cursor)
}
