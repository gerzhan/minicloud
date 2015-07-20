'use strict'
var S = require('string')
    /**
     * database table miniyun_users CRUD
     */
var userModel = dbPool.userModel
var userMetaModel = dbPool.userMetaModel
var helper = require("../helper")
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
exports.create = function*(name,password) {
    // var pinyin = require("pinyin")
    // var quanPin = pinyin(nick, {style: pinyin.STYLE_NORMAL})
    // var jianPin = pinyin(nick, {style: pinyin.STYLE_FIRST_LETTER})
    // var pinyinStr = S(quanPin).replaceAll(",","").s+"|"+S(jianPin).replaceAll(",","").s
    var userList = yield userModel.coFind({name:name})
    var salt = helper.getRandomString(6)
    var ciphertext = helper.encryptionPasswd(password, salt)
    
    if(userList.length==0){
        var user = yield userModel.coCreate({ 
            uuid:helper.getRandomString(32),
            name:name,
            password:ciphertext,
            status:1,
            salt:salt
            // user_name_pinyin:pinyinStr
        }) 
    }else{
        var user = userList[0]
        // user.user_name_pinyin = pinyinStr
        user.password = ciphertext
        yield user.coSave();
    }
    return user
}