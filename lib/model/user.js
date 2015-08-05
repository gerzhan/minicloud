'use strict'
var S = require('string')
    /**
     * database table miniyun_users CRUD
     */
var userModel = dbPool.userModel
var userMetaModel = dbPool.userMetaModel
var helpers = require('../helpers')
var MiniUserMeta = require('./user-meta')
    /**
     * Keyword search for users that the user list synchronization support paging. Such as keyword is empty it means the user list.
     * @param {String} key
     * @param {Integer} limit
     * @param {String} cursor
     * @return {Object}   
     * @api private
     */
var simplePageUser = function*(key, limit, cursor) {
        var orm = require('orm')
        var order = 'name ASC'
        if (global.oldVersion) {
            order = 'user_name ASC'
        }
        var conditons = {}
        if (key) {
            conditons.name = orm.like('%' + key + '%')
        }
        //pagination
        var page = yield helpers.simplePage(userModel, conditons, limit, cursor, order)
            //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor
        }
        var members = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            var fullMember = yield getFullMember(item)
            var member = {
                metas: fullMember.metas,
                name: fullMember.name,
                uuid: fullMember.uuid,
                crated_at: fullMember.created_at,
                updated_at: fullMember.updated_at
            }
            members.push(member)
        }
        data.members = members
        return data
    }
    /**
     * set user metas
     * @param {Object} user
     * @return {Object}  
     * @api private
     */
var getFullMember = function*(user) {
        var dbMetas = yield MiniUserMeta.getAll(user.id)
        var metas = {}
        for (var i = 0; i < dbMetas.length; i++) {
            var item = dbMetas[i]
            metas[item.key] = item.value
        }
        if (!metas.avatar) {
            metas.avatar = '/assets/default-avatar.png'
        }
        user.metas = metas
        return user
    }
    /**
     * find user by name
     * @param {String} name 
     * @return {Object}
     * @api public
     */
exports.getByName = function*(name) {
    var userList = yield userModel.coFind({
        name: name
    })
    if (userList.length > 0) {
        return yield getFullMember(userList[0])
    }
    return null
}

/**
 * find user by id
 * @param {Integer} id 
 * @return {Object}
 * @api public
 */

exports.getById = function*(id) {
        var userList = yield userModel.coFind({
            id: id
        })
        if (userList.length > 0) {
            return yield getFullMember(userList[0])
        }
        return null
    }
    /**
     * Create user 
     * @param {String} name 
     * @param {String} password  
     * @return {Object}    
     * @api public
     */
exports.create = function*(name, password) {
        // var pinyin = require('pinyin')
        // var quanPin = pinyin(nick, {style: pinyin.STYLE_NORMAL})
        // var jianPin = pinyin(nick, {style: pinyin.STYLE_FIRST_LETTER})
        // var pinyinStr = S(quanPin).replaceAll(',','').s+'|'+S(jianPin).replaceAll(',','').s
        var userList = yield userModel.coFind({
            name: name
        })
        var salt = helpers.getRandomString(6)
        var ciphertext = helpers.encryptionPasswd(password, salt)

        if (userList.length == 0) {
            var user = yield userModel.coCreate({
                uuid: helpers.getRandomString(32),
                name: name,
                password: ciphertext,
                status: 1,
                salt: salt
                    // user_name_pinyin:pinyinStr
            })
        } else {
            var user = userList[0]
                // user.user_name_pinyin = pinyinStr
            user.password = ciphertext
            yield user.coSave();
        }
        return user
    }
    /**
     * Remove user 
     * @param {String} name  
     * @api public
     */
exports.remove = function*(name) {
    yield userModel.find({
        name: name
    }).remove().coRun()
}

/**
 * exist user or not
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(name) {
        var userList = yield userModel.coFind({
            name: name
        })
        return userList.length > 0
    }
    /**
     * reset user password
     * @param {Integer} userId
     * @param {String} oldPasswd
     * @param {String} newPasswd
     * @return {Boolean}  
     * @api public
     */
exports.resetPasswd = function*(userId, oldPasswd, newPasswd) {
        var userList = yield userModel.coFind({
            id: userId
        })
        if (userList.length > 0) {
            var user = userList[0]
            var salt = user.salt
            var password = user.password
            var ciphertext = helpers.encryptionPasswd(oldPasswd, salt)
            if (ciphertext === password) {
                var salt = helpers.getRandomString(6)
                var ciphertext = helpers.encryptionPasswd(newPasswd, salt)
                user.password = ciphertext
                user.salt = salt
                yield user.coSave()

                return true
            }
        }
        return false
    }
    /**
     * Get members list 
     * @param {Integer} limit
     * @param {String} cursor
     * @return {Object}   
     * @api public
     */
exports.list = function*(limit, cursor) {
    return yield simplePageUser(null, limit, cursor)
}

/**
 * Search member
 * @param {String} key
 * @param {Integer} limit
 * @param {String} cursor
 * @return {Object}   
 * @api public
 */
exports.search = function*(key, limit, cursor) {
    return yield simplePageUser(key, limit, cursor)
}
