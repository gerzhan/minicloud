'use strict'
/**
 * database table miniyun_events CRUD
 */
var eventModel = dbPool.eventModel
var php = require('phpjs')
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
            }, limit, cursor, 'UPDATED_AT DESC')
            //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor
        }
        var events = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            var event = {}
            event.updated_at = item.updated_at
            var context = php.unserialize(item.context)
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
     * Create login event 
     * @param {Integer} userId 
     * @param {Integer} deviceId  
     * @param {String} ip
     * @return {Object}    
     * @api public
     */
exports.createLoginEvent = function*(userId, deviceId, ip) {
    var context = php.serialize({
        action: 0,
        ip: ip
    })
    return yield eventModel.coCreate({
        uuid: null,
        type: 1,
        user_id: userId,
        device_id: deviceId,
        action: 0,
        path: null,
        context: context
    })
}

/**
 * clean login events
 * @param {Integer} userId 
 * @api public
 */
exports.cleanLoginEvents = function*(userId) {
        yield eventModel.find({
            user_id: userId,
            type: 1
        }).remove().coRun()
    }
    /**
     * remove event
     * @param {integer} device_id
     * @api public
     */
exports.removeAllByDeviceId = function*(deviceId) {
    yield eventModel.find({
        device_id: deviceId
    }).remove().coRun()
}
