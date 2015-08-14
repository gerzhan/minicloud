'use strict'
/**
 * database table minicloud_user_metas CRUD
 */
/**
 * Module dependencies.
 */
var userMetaModel = dbPool.userMetaModel
var userModel = dbPool.userModel
var helpers = require('../helpers')
var S = require('string')
var co = require('co')
var pinyin = require('pinyin')
    // set hook
userMetaModel.afterSave(function(next) {
        var userId = this.user_id
        var key = this.key
        var nick = this.value
        co.wrap(function*() {
            //update user detail include:name/nick
            //support chinese pinyin
            if (key === 'nick') {
                var members = yield userModel.coFind({
                    id: userId
                })
                if (members.length > 0) {
                    var member = members[0]
                    var name = member.name
                    var nameQuanPin = pinyin(name, {
                        style: pinyin.STYLE_NORMAL
                    })
                    var nameJianPin = pinyin(name, {
                            style: pinyin.STYLE_FIRST_LETTER
                        })
                        //get name pinyin
                    var nameDetail = S(nameQuanPin).replaceAll(',', '').s + '|' + S(nameJianPin).replaceAll(',', '').s

                    var nickQuanPin = pinyin(nick, {
                        style: pinyin.STYLE_NORMAL
                    })
                    var nickJianPin = pinyin(nick, {
                            style: pinyin.STYLE_FIRST_LETTER
                        })
                        //get nick pinyin
                    var nickDetail = S(nickQuanPin).replaceAll(',', '').s + '|' + S(nickJianPin).replaceAll(',', '').s
                        //update detail
                    member.detail = nameDetail + '|' + nickDetail
                    member = yield member.coSave()
                }
                return next()
            }

        })()
    })
    /**
     * get meta by key
     * @param {Integer} userId
     * @param {String} key 
     * @return {Object}
     * @api public
     */
exports.getByKey = function*(userId, key) {
        var metaList = yield userMetaModel.coFind({
            user_id: userId,
            key: key
        })
        if (metaList.length > 0) {
            return metaList[0]
        }
        return null
    }
    /**
     * create meta record,if existed then update
     * @param {Integer} userId
     * @param {String} metaKey
     * @param {String} metaValue
     * @return {Object}
     * @api public
     */
exports.create = function*(userId, metaKey, metaValue) {
        var metaList = yield userMetaModel.coFind({
            user_id: userId,
            key: metaKey
        })
        var meta = null
        if (metaList.length == 0) {
            meta = yield userMetaModel.coCreate({
                user_id: userId,
                key: metaKey,
                value: metaValue
            })
        } else {
            meta = metaList[0]
            meta.value = metaValue
            meta = yield meta.coSave()
        }
        return meta
    }
    /**
     * convert db item to map
     * @param {Object} item 
     * @return {Object}
     * @api public
     */
function db2Map(item) {
    var value = item.value
    if (item.key == 'total_space') {
        value = parseInt(value)
    }
    if (item.key == 'used_space') {
        value = parseInt(value)
    }
    if (item.key == 'is_admin') {
        if (value == '1') {
            value = true
        } else {
            value = false
        }
    }
    if (item.key == 'password_error_count') {
        value = parseInt(value)
    }
    var newItem = {
        id: item.id,
        key: item.key,
        value: value,
        created_at: item.created_at,
        updated_at: item.updated_at
    }
    return newItem
}
/**
 * convert db items  to array
 * @param {Object} item 
 * @return {Object}
 * @api public
 */
function db2Array(items) {
    var data = []
    for (var i = 0; i < items.length; i++) {
        data.push(db2Map(items[i]))
    }
    return data
}
/**
 * get userid's all metas
 * @param {Integer} userId 
 * @return {Object}
 * @api public
 */
exports.getAll = function*(userId) {
        var metaList = yield userMetaModel.coFind({
            user_id: userId
        })
        return db2Array(metaList)
    }
    /**
     * To determine whether the user is locked
     * @param {Integer} userId 
     * @return {Boolean}
     * @api public
     */
exports.isLocked = function*(userId) {

        var metaList = yield userMetaModel.coFind({
            user_id: userId,
            key: 'password_error_count'
        })
        if (metaList.length > 0) {
            var meta = metaList[0]
            var passwordErrorCount = parseInt(meta.value)
            if (passwordErrorCount > 4) {
                //more than 15 minutes,password_error_count set 0
                var end = new Date()
                var start = meta.updated_at
                var diff = helpers.timeDiff(start, end)
                if (diff > 1000 * 60 * 15) {
                    meta.value = '0'
                    meta = yield meta.coSave()
                    return false
                }
                return true
            }
        }
        return false
    }
    /**
     * record  number of password errors
     * @param {Integer} userId 
     * @return {Object}
     * @api public
     */
exports.updatePasswordErrorTimes = function*(userId) {
        var key = 'password_error_count'
        var metaList = yield userMetaModel.coFind({
            user_id: userId,
            key: key
        })
        if (metaList.length > 0) {
            var meta = metaList[0]
            var errorCount = parseInt(meta.value) + 1
            meta.value = errorCount.toString()
            meta = yield meta.coSave()
        } else {
            var meta = yield userMetaModel.coCreate({
                user_id: userId,
                key: key,
                value: '1'
            })
        }
        return meta
    }
    /**
     * reset password number of errors
     * @param {Integer} userId 
     * @return {Object}
     * @api public
     */
exports.resetPasswordErrorTimes = function*(userId) {
    var key = 'password_error_count'
    var metaList = yield userMetaModel.coFind({
        user_id: userId,
        key: key
    })
    if (metaList.length > 0) {
        var meta = metaList[0]
        meta.value = '0'
        meta = yield meta.coSave()
    } else {
        var meta = yield userMetaModel.coCreate({
            user_id: userId,
            key: key,
            value: '0'
        })
    }
    return meta
}
