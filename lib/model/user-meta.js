'use strict'
/**
 * database table miniyun_user_metas CRUD
 */
/**
 * Module dependencies.
 */
var userMetaModel = dbPool.userMetaModel
var helper = require('../helper')
    /**
     * create meta record，if existed then update
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
            if (process.env.ORM_PROTOCOL == 'mongodb') {
                console.log({metaValue:metaValue})
                console.log({"meta.value":meta.value)
            }
        }        
        return meta
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
            key: "password_error_count"
        })
        if (metaList.length > 0) {
            var meta = metaList[0]
                //more than 15 minutes,password_error_count set 0
            var end = new Date()
            var start = meta.updated_at
            var diff = helper.timeDiff(start, end)

            if (diff > 1000 * 60 * 15) {
                meta.value = "0"
                meta = yield meta.coSave()
            }
            var passwordErrorCount = parseInt(meta.value)
            if (process.env.ORM_PROTOCOL == 'mongodb') {
                console.log({
                    passwordErrorCount: passwordErrorCount
                })
            }
            if (passwordErrorCount > 4) {
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
        var key = "password_error_count"
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
                value: "1"
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
    var key = "password_error_count"
    var metaList = yield userMetaModel.coFind({
        user_id: userId,
        key: key
    })
    if (metaList.length > 0) {
        var meta = metaList[0]
        meta.value = "0"
        meta = yield meta.coSave()
    } else {
        var meta = yield userMetaModel.coCreate({
            user_id: userId,
            key: key,
            value: "0"
        })
    }
    return meta
}
