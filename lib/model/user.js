'use strict'
var S = require('string')
    /**
     * database table miniyun_users CRUD
     */
var userModel = dbPool.userModel
var userMetaModel = dbPool.userMetaModel
var helpers = require("../helpers")
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
            return userList[0]
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
            return userList[0]
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
        // var pinyin = require("pinyin")
        // var quanPin = pinyin(nick, {style: pinyin.STYLE_NORMAL})
        // var jianPin = pinyin(nick, {style: pinyin.STYLE_FIRST_LETTER})
        // var pinyinStr = S(quanPin).replaceAll(",","").s+"|"+S(jianPin).replaceAll(",","").s
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
     * Get list 
     * @api public
     */
exports.list = function*() {
    var userModelList = yield userModel.coFind()
    return userModelList
}

/**
 * Search member
 * @param {String} key  
 * @api public
 */
exports.search = function*(key) {
    var orm = require('orm')
    var aimIds = {}
    var userList = yield userModel.find({
        name: orm.like('%' + key + '%')
    }).coRun()
    for (var i = 0; i < userList.length; i++) {
        aimIds[userList[i].id] = userList[i].id
    }
    var userMetaList = yield userMetaModel.find({
        key: "nick"
    }).find({
        value: orm.like('%' + key + '%')
    }).coRun()
    for (var j = 0; j < userMetaList.length; j++) {
        aimIds[userMetaList[j].user_id] = userMetaList[j].user_id
    }
    var idsInArray = []
    for (var aimId in aimIds) {
        idsInArray.push(aimId)
    }
    var result = yield userModel.find({
        id: idsInArray
    }).coRun()
    return result
}
