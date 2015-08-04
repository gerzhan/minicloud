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
        var x = '0123456789qwertyuiopasdfghjklzxcvbnm'
        var tmp = ''
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
        var str = userId + '_' + deviceType + '_' + deviceInfo + '_' + deviceName + '_RGeavfnK8GMjBjDQ'
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
        if (clientId == 'd6n6Hy8CtSFEVqNh') {
            deviceType = 2
        }
        if (clientId == 'c9Sxzc47pnmavzfy') {
            deviceType = 3
        }
        if (clientId == 'MsUEu69sHtcDDeCp') {
            deviceType = 4
        }
        if (clientId == 'V8G9svK8VDzezLum') {
            deviceType = 5
        }
        if (clientId == 'Lt7hPcA6nuX38FY4') {
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
exports.simplePage = function*(model, conditons, limit, cursor, order) {
    var orm = require('orm')
    if (!limit) {
        limit = 100
    } else {
        limit = parseInt(limit)
    }
    if (!cursor) {
        cursor = ''
    }
    if (!order) {
        order = 'id ASC'
    }
    var isAsc = order.toLowerCase().indexOf('asc') > 0

    var miniCursor = require('./model/cursor')
    var lastCursorValue = 0
    if (cursor == '') {
        // get first cursor 
        var firstCursors = yield model.find(conditons).orderRaw(order).limit(1).coRun()
        if (firstCursors.length > 0) {
            lastCursorValue = firstCursors[0].id
        }
        if (isAsc) {
            lastCursorValue-=1
        } else {
            lastCursorValue+=1
        }
    } else {
        // get last cursor
        lastCursorValue = yield miniCursor.getValueByCursor(cursor)
    }
    var idCondition = {
        id: orm.lt(lastCursorValue)
    }
    if (isAsc) {
        idCondition = {
            id: orm.gt(lastCursorValue)
        }
    }
    var items = yield model.find(conditons).where(idCondition).limit(limit).orderRaw(order).coRun()
        //get maxId/minId
    var maxId = 0
    for (var i = 0; i < items.length; i++) {
        var currentId = items[i].id
        if (maxId < currentId) {
            maxId = currentId
        }
    }
    var minId = 0
    if (items.length > 0) {
        minId = items[0].id
        for (var i = 1; i < items.length; i++) {
            var currentId = items[i].id
            if (minId > currentId) {
                minId = currentId
            }
        }
    }
    var hasMoreId = maxId
    if (!isAsc) {
        hasMoreId = minId
    }
    var hasMoreCondition = {
        id: orm.lt(hasMoreId)
    }
    if (isAsc) {
        hasMoreCondition = {
            id: orm.gt(hasMoreId)
        }
    }
    //has more
    var hasMore = false
    var moreItems = yield model.find(conditons).where(hasMoreCondition).limit(1).orderRaw(order).coRun()
    if (moreItems.length > 0) {
        hasMore = true
            //next cursor
        var nextCursor = yield miniCursor.create(hasMoreId)
        cursor = nextCursor.cursor
    }
    return {
        items: items,
        cursor: cursor,
        has_more: hasMore
    }
}
