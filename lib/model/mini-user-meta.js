'use strict'
/**
 * database table miniyun_user_metas CRUD
 */
var usermetaModel = dbPool.usermetaModel
var MiniUtil = require('../mini-util')
    /**
     * create meta record，if existed then update
     * @param {Integer} userId
     * @param {String} metaKey
     * @param {String} metaValue
     * @return {Object}
     * @api public
     */
exports.create = function*(userId, metaKey, metaValue) {
        var metaList = yield usermetaModel.coFind({
            user_id: userId,
            meta_key: metaKey
        })
        if (metaList.length == 0) {
            var usermeta = yield usermetaModel.coCreate({
                user_id: userId,
                meta_key: metaKey,
                meta_value: metaValue
            })
        } else {
            var usermeta = metaList[0]
            usermeta.meta_value = metaValue
            usermeta = yield usermeta.coSave()
        }
        return usermeta
    }
    /**
     * get all attributes of the user
     * @param {Integer} userId 
     * @return {Object}
     * @api public
     */
exports.getMetas = function*(userId) {
        var metaList = yield usermetaModel.coFind({
            user_id: userId
        })
        if (metaList.length > 0) {
            return metaList
        }
        return null
    }
    /**
     * To determine whether the user is locked
     * @param {Integer} userId 
     * @return {Boolean}
     * @api public
     */
exports.isLocked = function*(userId) {

        var metaList = yield usermetaModel.coFind({
            user_id: userId,
            meta_key: "password_error_count"
        })
        if (metaList.length > 0) {
            var meta = metaList[0]
                //more than 15 minutes,password_error_count set 0
            var end = new Date()
            var start = meta.updated_at
            var diff = MiniUtil.timeDiff(start, end)

            if (diff > 1000 * 60 * 15) {
                meta.meta_value = "0"
                meta = yield meta.coSave()
            }
            var passwordErrorCount = parseInt(meta.meta_value)
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
        var metaKey = "password_error_count"
        var metaList = yield usermetaModel.coFind({
            user_id: userId,
            meta_key: metaKey
        })
        if (metaList.length > 0) {
            var meta = metaList[0]
            var errorCount = parseInt(meta.meta_value) + 1
            meta.meta_value = errorCount.toString()
            meta = yield meta.coSave()
            return meta
        } else {
            var meta = yield usermetaModel.coCreate({
                user_id: userId,
                meta_key: metaKey,
                meta_value: "1"
            })
            return meta
        }
    } 
     /**
     * reset password number of errors
     * @param {Integer} userId 
     * @return {Object}
     * @api public
     */
exports.resetPasswordErrorTimes = function*(userId) {
    var metaKey = "password_error_count"
    var metaList = yield usermetaModel.coFind({
        user_id: userId,
        meta_key: metaKey
    })
    if (metaList.length > 0) {
        var meta = metaList[0]
        meta.meta_value = "0"
        meta = yield meta.coSave()
        return meta
    } else {
        var meta = yield usermetaModel.coCreate({
            user_id: userId,
            meta_key: metaKey,
            meta_value: "0"
        })
        return meta
    }
}
