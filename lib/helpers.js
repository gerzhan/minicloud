'use strict'
/**
 * Module dependencies.
 */
var md5 = require('md5')
var pinyin = require('pinyin')
var S = require('string')
    /**
     * create a random string
     * @param {Integer} length
     * @return {String}
     * @api public
     */
var getRandomString = function(length) {
        var len = length || 32
        var x = '0123456789qwertyuiopasdfghjklzxcvbnm'
        var tmp = ''
        for (var i = 0; i < len; i++) {
            tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
        }
        return tmp
    }
    /**
     * Encryption Password  
     * @param {String} text
     * @param {String} salt 
     * @return {String}
     * @api public
     */
var encryptionPasswd = function(text, salt) {
        var temp1 = md5(text) + salt
        var ciphertext = md5(temp1)
        return ciphertext
    }
    /**
     * Get two time difference, the return value ms 
     * @param {String} text
     * @param {String} salt 
     * @return {String}
     * @api public
     */
var timeDiff = function(start, end) {
    var startTime = start.getTime()
    var endTime = end.getTime()
    return endTime - startTime
}

/**
 * page conditions 
 * @param {Object} model
 * @param {Integer} page 
 * @param {Integer} limit  
 * @param {Object} conditions 
 * @param {Object} orderRules  
 * @return {Array}
 * @api public
 */
var simplePageList = function*(model, page, limit, conditions, orderRules) {
        page = parseInt(page)
        limit = parseInt(limit)
        conditions = conditions || {}
        orderRules = orderRules || {}
            //get count
        var count = yield model.count({
            where: conditions
        }) 
        var orders = []
        for (var propertyName in orderRules) { 
            var value = orderRules[propertyName]
            orders.push([propertyName,value])
        } 
        var items = yield model.findAll({
            where: conditions,
            limit: limit,
            offset: page * limit,
            order: orders
        })
        return {
            items: items,
            count: count
        }
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
var simplePage = function*(model, conditons, limit, cursor, order) {
        limit = parseInt(limit)
        if (!cursor) {
            cursor = ''
        }
        var isAsc = order.toLowerCase().indexOf('asc') >= 0
        var MiniCursor = require('./model/cursor')
        var beforeCursorValue = 0
        if (cursor !== '') {
            // get last cursor
            var cursorValue = yield MiniCursor.getValueByCursor(cursor)
            if (cursorValue) {
                beforeCursorValue = cursorValue
            }
        }
        if (beforeCursorValue === 0) {
            // get first cursor 
            var firstCursors = yield model.findAll({
                where: conditons,
                limit: 1,
                order: order
            })
            if (firstCursors.length > 0) {
                beforeCursorValue = firstCursors[0].id
            }
            if (isAsc) {
                beforeCursorValue -= 1
            } else {
                beforeCursorValue += 1
            }
        } else {
            // get last cursor
            beforeCursorValue = yield MiniCursor.getValueByCursor(cursor)
        }
        var idCondition = {
            $lt: beforeCursorValue
        }
        if (isAsc) {
            idCondition = {
                $gt: beforeCursorValue
            }
        }
        //get count
        var count = yield model.count({
            where: conditons
        })
        conditons['id'] = idCondition
        var items = yield model.findAll({
            where: conditons,
            limit: limit,
            order: order
        })
        var hasMore = false
            //has more and next cursor
        if (items.length == limit) {
            var hasMoreId = 0
            if (items.length > 0) {
                hasMoreId = items[items.length - 1].id
            }
            var hasMoreCondition = {
                $lt: hasMoreId
            }
            if (isAsc) {
                hasMoreCondition = {
                    $gt: hasMoreId
                }
            }
            //has more 
            conditons['id'] = hasMoreCondition
            var moreItems = yield model.findAll({
                where: conditons,
                limit: 1,
                order: order
            })
            if (moreItems.length > 0) {
                hasMore = true
                    //next cursor
                var nextCursor = yield MiniCursor.create(hasMoreId)
                cursor = nextCursor.cursor
            }
        }
        return {
            items: items,
            cursor: cursor,
            has_more: hasMore,
            count: count
        }
    }
    /**
     * return pinyin
     * @param {String} name 
     * @return {String}
     * @api public
     */
var getPinyin = function(name) {
        var nameQuanPin = pinyin(name, {
            style: pinyin.STYLE_NORMAL
        })
        var nameJianPin = pinyin(name, {
                style: pinyin.STYLE_FIRST_LETTER
            })
            //get name pinyin
        return S(nameQuanPin).replaceAll(',', '').s + '|' + S(nameJianPin).replaceAll(',', '').s
    }
    /**
     * return path
     * @param {String} departmentPath 
     * @return {Object} user
     * @api public
     */
var getValidDepartmentPath = function*(departmentPath, user) {
    if (user.role !== SUPER_ADMIN) {
        var userDepartmentPath = user.department_path
        if (departmentPath.indexOf(userDepartmentPath) !== 0) {
            return userDepartmentPath
        }
    }
    return departmentPath
}

exports.getPinyin = getPinyin
exports.simplePage = simplePage
exports.simplePageList = simplePageList
exports.timeDiff = timeDiff
exports.encryptionPasswd = encryptionPasswd
exports.getRandomString = getRandomString
exports.getValidDepartmentPath = getValidDepartmentPath
