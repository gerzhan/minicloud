'use strict'
/**
 * database table miniyun_events CRUD
 */
var eventModel = dbPool.eventModel
    /**
     * get login event 
     * @param {Integer} userId 
     * @param {Integer} type  
     * @return {Object}    
     * @api public
     */
exports.getLoginEventsByUserId = function*(userId) {
        return yield eventModel.coFind({
            user_id: userId,
            type: 1
        })
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
    var php = require('phpjs')
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
