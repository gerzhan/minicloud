'use strict'
/**
 * Module dependencies.
 */
var md5 = require('md5')
    /**
     * create a random string
     * @param {Integer} length
     * @return {String}
     * @api public
     */
exports.getRandomString = function(length) {
        var len = length || 32
        var x = "0123456789qwertyuiopasdfghjklzxcvbnm"
        var tmp = ""
        for (var i = 0; i < len; i++) {
            tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
        }
        return tmp
    }
    /**
     * return User device UUID
     * @param {Integer} userId
     * @param {String} deviceType
     * @param {String} deviceName
     * @param {String} deviceInfo
     * @return {String}
     * @api public
     */
exports.getDeviceUUID = function(userId, deviceType, deviceName, deviceInfo) {
        var str = userId + "_" + deviceType + "_" + deviceInfo + "_" + deviceName + "_RGeavfnK8GMjBjDQ"
        return md5(str)
    }
    /**
     * Encryption Password  
     * @param {String} text
     * @param {String} salt 
     * @return {String}
     * @api public
     */
exports.encryptionPasswd = function(text, salt) {
        var temp1 = md5(text) + salt
        var ciphertext = md5(temp1)
        return ciphertext
    }
    /**
     * old version 
     * clientId->deviceTypeId
     * @param {String} clientId 
     * @return {String}
     * @api public
     */
exports.getDeviceTypeByClientId = function(clientId) {
        var deviceType = 1
        if (clientId == "d6n6Hy8CtSFEVqNh") {
            deviceType = 2
        }
        if (clientId == "c9Sxzc47pnmavzfy") {
            deviceType = 3
        }
        if (clientId == "MsUEu69sHtcDDeCp") {
            deviceType = 4
        }
        if (clientId == "V8G9svK8VDzezLum") {
            deviceType = 5
        }
        if (clientId == "Lt7hPcA6nuX38FY4") {
            deviceType = 6
        }
        return deviceType
    }
    /**
     * Get two time difference, the return value ms 
     * @param {String} text
     * @param {String} salt 
     * @return {String}
     * @api public
     */
exports.timeDiff = function(start, end) {
        var startTime = start.getTime()
        var endTime = end.getTime()
        return endTime - startTime
    }
    /**
     * page conditons 
     * @param {Object} model
     * @param {Array} conditons 
     * @param {String} order 
     * @param {Integer} limit 
     * @param {String} cursor 
     * @return {Array}
     * @api public
     */
exports.page = function*(model, conditons, limit, cursor, order) {
    var miniCursor = require('./model/cursor')
    if (!limit) {
        limit = 100
    } else {
        limit = parseInt(limit)
    }
    if (!order) {
        order = "id ASC"
    }
    var lastValue = yield miniCursor.getValueByCursor(cursor)
    var items = yield model.find(conditons).where("id>?", [lastValue]).limit(limit).orderRaw(order).coRun()
        //get maxId
    var maxId = 0
    for (var i = 0; i < items.length; i++) {
        var currentId = items[i].id
        if (maxId < currentId) {
            maxId = currentId
        }
    }
    //has more
    var hasMore = false
    var moreItems = yield model.find(conditons).where("id>?", [maxId]).limit(1).coRun()
    if (moreItems.length > 0) {
        hasMore = true
            //next cursor
        var nextCursor = yield miniCursor.create(maxId)
        cursor = nextCursor.cursor
    }
    return {
        items: items,
        cursor: cursor,
        has_more: hasMore
    }
}
