'use strict'
/**
 * database table minicloud_events CRUD
 */
var eventModel = sequelizePool.eventModel
var helpers = require('../helpers')
var MiniDevice = require('./device')
    /**
     * get login event 
     * @param {Integer} userId 
     * @param {Integer} limit
     * @param {String} cursor  
     * @return {Object}    
     * @api public
     */
exports.getLoginEventsByUserId = function*(userId, limit, cursor) {
        //pagination
        var page = yield helpers.simplePage(eventModel, {
                user_id: userId,
                type: 1
            }, limit, cursor, '-id')
            //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor,
            count: page.count
        }
        var events = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            var event = {}
            event.updated_at = item.updated_at
            var context = JSON.parse(item.context)
            var device = yield MiniDevice.getById(item.device_id)
            event.id = item.id
            event.ip = context.ip
            event.logined = context.action == '1'
            if (device) {
                event.name = device.name
                event.client_id = device.client_id
            }
            events.push(event)
        }
        data.events = events
        return data
    }
    /**
     * get all events 
     * @param {Integer} userId 
     * @param {Integer} limit
     * @param {String} cursor  
     * @return {Object}    
     * @api public
     */
exports.getAllEventsByUserId = function*(userId, limit, cursor) {
        var page = yield helpers.simplePage(eventModel, {
            user_id: userId
        }, limit, cursor, '-id')

        //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor,
            count: page.count
        }
        var events = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            var event = {}
            event.updated_at = item.updated_at
            var context = JSON.parse(item.context)
            var device = yield MiniDevice.getById(item.device_id)
            event.id = item.id
            event.ip = context.ip
            if (item.type === 1) {
                if (device) {
                    event.device_name = device.name
                    event.client_id = device.client_id
                }
                event.logined = context.action == 1
                events.push(event)
            }
            if (item.type === 0) {
                event.logined = context.action == 3
                event.file_id = context.file_id
                event.summary = context.summary
                events.push(event)
            }
        }
        data.events = events
        return data

    }
    /**
     * Create login event 
     * @param {Integer} userId 
     * @param {Integer} deviceId  
     * @param {String} ip
     * @return {Object}    
     * @api public
     */
exports.createLoginEvent = function*(userId, deviceId, ip) {
        var context = JSON.stringify({
            action: 1,
            ip: ip
        })
        return yield eventModel.create({
            uuid: null,
            type: 1,
            user_id: userId,
            device_id: deviceId,
            action: 1,
            path: null,
            context: context
        })
    }
    /**
     * Create fake delete event 
     * @param {Integer} userId 
     * @param {Integer} deviceId  
     * @param {String} ip
     * @return {Object}    
     * @api public
     */
exports.createFakeDeleteEvent = function*(userId, device, ip, count, file) {
    var context = JSON.stringify({
        action: 3,
        ip: ip,
        file_id: file.id,
        summary: {
            file_name: file.name,
            count: count,
            device_name: device.name,
            client_id: device.client_id
        }

    })
    return yield eventModel.create({
        uuid: null,
        type: 0,
        user_id: userId,
        device_id: device.id,
        action: 3,
        path: file.path_lower,
        context: context
    })
}

/**
 * clean login events
 * @param {Integer} userId 
 * @api public
 */
exports.cleanLoginEvents = function*(userId) {
        yield eventModel.destroy({
            where: {
                user_id: userId,
                type: 1
            }
        })
    }
    /**
     * remove event
     * @param {integer} device_id
     * @api public
     */
exports.removeAllByDeviceId = function*(deviceId) {
        yield eventModel.destroy({
            where: {
                device_id: deviceId
            }
        })
    }
    /**
     * get all events
     * @param {integer} device_id
     * @return [array]   
     * @api public
     */
exports.getAllEventsByDeviceId = function*(deviceId) {
    var eventList = yield eventModel.findAll({
        where: {
            device_id: deviceId
        }
    })
    return eventList
}
