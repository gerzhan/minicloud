'use strict'
/**
 * database table minicloud_events CRUD
 */
var eventModel = sequelizePool.eventModel
var helpers = require('../helpers')
var fileHelpers = require('../file-helpers')
var MiniDevice = require('./device')
var EVENT_LOGIN = 1
var EVENT_LOGOUT = 2
var EVENT_FILE_CREATE = 4
var EVENT_FILE_MOVE = 8
var EVENT_FILE_FAKE_DELETE = 16
var EVENT_FILE_CLEAN = 32
var EVENT_FILE_DOWNLOAD = 64
var EVENT_FILE_VIEW = 128
    /**
     * data object to view object
     * @param {Object} item  
     * @return {Object}    
     * @api private
     */
var _do2vo = function*(item) {
        var event = {}
        var type = item.type
        var deviceName = item.device_name
        var clientId = item.client_id
        var device = yield MiniDevice.getById(item.device_id)
            // handle device remove
        if (device) {
            deviceName = device.name
            clientId = device.client_id
        } 
        event.ip = item.ip
        event.type = type
        event.updated_at = item.updated_at
        event.device_name = deviceName
        event.client_id = clientId
        if (type === EVENT_LOGIN) {
            //login event
            event.context = {
                logined: true
            }
        } else if (type === EVENT_LOGOUT) {
            //logout event
            event.context = {
                logined: false
            }
        } else if (type === EVENT_FILE_CREATE) {
            //file create event
            var pathLower = item.path_lower
            var pathLower = fileHelpers.relativePath(item.user_id, pathLower)
            var context = JSON.parse(item.context)
            event.context = {
                path_lower: pathLower,
                name: context.name,
                file_type: context.file_type
            }
        } else if (type === EVENT_FILE_MOVE) {
            //file move event
            var pathLower = item.path_lower
            var pathLower = fileHelpers.relativePath(item.user_id, pathLower)

            var context = JSON.parse(item.context)
            var fromPath = fileHelpers.relativePath(item.user_id, context.from_path)
            event.context = {
                path_lower: pathLower,
                name: context.name,
                file_type: context.file_type,
                from_name: context.from_name,
                from_path: fromPath
            }
        } else if (type === EVENT_FILE_FAKE_DELETE) {
            //file fake delete event
            var pathLower = item.path_lower
            var pathLower = fileHelpers.relativePath(item.user_id, pathLower)
            var context = JSON.parse(item.context)
            event.context = {
                path_lower: pathLower,
                name: context.name,
                file_type: context.file_type,
                descendant_count: context.descendant_count
            }
        }
        return event
    }
    /**
     * get all events 
     * @param {Array} conditions 
     * @param {Integer} limit
     * @param {String} cursor  
     * @return {Object}    
     * @api public
     */
var getList = function*(conditions, limit, cursor) {
        var page = yield helpers.simplePage(eventModel, conditions, limit, cursor, '-id')
            //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor,
            count: page.count
        }
        var events = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            events.push(yield _do2vo(item))
        }
        data.events = events
        return data
    }
    /**
     * clean login events
     * @param {Integer} userId 
     * @api public
     */
var cleanLoginEvents = function*(userId) {
        yield eventModel.destroy({
            where: {
                user_id: userId,
                type: {
                    $in: [EVENT_LOGIN, EVENT_LOGOUT]
                }
            }
        })
    }
    /**
     * remove event
     * @param {integer} deviceId
     * @api public
     */
var cleanByDeviceId = function*(deviceId) {
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
var getAllByDeviceId = function*(deviceId) {
        var eventList = yield eventModel.findAll({
            where: {
                device_id: deviceId
            }
        })
        return eventList
    }
    /**
     * Create login event 
     * @param {Object} device  
     * @param {String} ip
     * @return {Object}    
     * @api public
     */
var createLoginEvent = function*(ip, device) {
        var type = EVENT_LOGIN
        var userId = device.user_id
        var deviceId = device.id
        var deviceName = device.name
        var clientId = device.client_id
        return yield eventModel.create({
            type: type,
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            client_id: clientId,
            ip: ip
        })
    }
    /**
     * Create logout event 
     * @param {Object} device  
     * @param {String} ip
     * @return {Object}    
     * @api public
     */
var createLogoutEvent = function*(ip, device) {
        var type = EVENT_LOGOUT
        var userId = device.user_id
        var deviceId = device.id
        var deviceName = device.name
        var clientId = device.client_id
        return yield eventModel.create({
            type: type,
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            client_id: clientId,
            ip: ip
        })
    }
    /**
     * Create file create event 
     * @param {String} ip
     * @param {Object} device  
     * @param {Object} file  
     * @return {Object}    
     * @api public
     */
var createNewFileEvent = function*(ip, device, file) {
        var type = EVENT_FILE_CREATE
        var userId = device.user_id
        var deviceId = device.id
        var deviceName = device.name
        var clientId = device.client_id
        var pathLower = file.path_lower
        var context = {
            file_type: file.type,
            name: file.name
        }
        return yield eventModel.create({
            type: type,
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            client_id: clientId,
            ip: ip,
            path_lower: pathLower,
            context: JSON.stringify(context)
        })
    }
    /**
     * Create move file event 
     * @param {String} ip
     * @param {Object} device  
     * @param {Object} file  
     * @return {Object}    
     * @api public
     */
var createFileMoveEvent = function*(ip, device, file) {
        var type = EVENT_FILE_MOVE
        var userId = device.user_id
        var deviceId = device.id
        var deviceName = device.name
        var clientId = device.client_id
        var pathLower = file.path_lower
        var context = {
            file_type: file.type,
            name: file.name,
            from_name: file.previous('name'),
            from_path: file.previous('path_lower'),
        }
        return yield eventModel.create({
            type: type,
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            client_id: clientId,
            ip: ip,
            path_lower: pathLower,
            context: JSON.stringify(context)
        })
    }
    /**
     * Create fake delete event 
     * @param {String} ip 
     * @param {Object} device  
     * @param {Object} file
     * @param {Integer} descendantCount
     * @return {Object}    
     * @api public
     */
var createFileFakeDeleteEvent = function*(ip, device, file, descendantCount) {
    descendantCount = descendantCount || 1
    var type = EVENT_FILE_FAKE_DELETE
    var userId = device.user_id
    var deviceId = device.id
    var deviceName = device.name
    var clientId = device.client_id
    var pathLower = file.path_lower
    var context = {
        file_type: file.type,
        descendant_count: descendantCount
    }
    return yield eventModel.create({
        type: type,
        user_id: userId,
        device_id: deviceId,
        device_name: deviceName,
        client_id: clientId,
        ip: ip,
        path_lower: pathLower,
        context: JSON.stringify(context)
    })
}
exports.createLoginEvent = createLoginEvent
exports.createLogoutEvent = createLogoutEvent
exports.createNewFileEvent = createNewFileEvent
exports.createFileMoveEvent = createFileMoveEvent
exports.createFileFakeDeleteEvent = createFileFakeDeleteEvent
exports.getAllByDeviceId = getAllByDeviceId
exports.getList = getList
exports.cleanLoginEvents = cleanLoginEvents
exports.cleanByDeviceId = cleanByDeviceId
