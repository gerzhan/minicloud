'use strict'
var S = require('string')
    /**
     * database table minicloud_users CRUD
     */
var userModel = sequelizePool.userModel
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
        var order = '-id'
        var conditons = {}
        if (key) {
            conditons.detail = orm.like('%' + key + '%')
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
                created_at: fullMember.createdAt,
                updated_at: fullMember.updatedAt
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
    var user = yield userModel.findOne({
        where: {
            name: name
        }
    })
    if (user) {
        return yield getFullMember(user)
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
    var user = yield userModel.findById(id) 
    if(user){
        return yield getFullMember(user)
    }
    return null
}

/**
 * find user by uuid
 * @param {String} uuid 
 * @return {Object}
 * @api public
 */

exports.getByUuid = function*(uuid) {
        return yield userModel.findOne({
            where: {
                uuid: uuid
            }
        })
    }
    /**
     * Create user 
     * @param {String} name 
     * @param {String} password  
     * @return {Object}    
     * @api public
     */
exports.create = function*(name, password) { 
        var user = yield userModel.findOne({
            where: {
                name: name
            }
        })
        var salt = helpers.getRandomString(6)
        var ciphertext = helpers.encryptionPasswd(password, salt) 
        if (!user) {
            var user = yield userModel.create({
                uuid: helpers.getRandomString(32),
                name: name,
                password: ciphertext,
                status: 1,
                salt: salt
            })
        } else { 
            user.password = ciphertext
            user.salt = salt
            user = yield user.save() 
        }
        return user
    }
    /**
     * Remove user 
     * @param {String} name  
     * @api public
     */
exports.remove = function*(name) {
    yield userModel.destroy({
        where: {
            name: name
        }
    })
}

/**
 * exist user or not
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(name) {
        var user = yield userModel.findOne({
            where:{
            name: name
            }
        })
        return user
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
        var user = yield userModel.findById(userId)
        if (user) { 
            var salt = user.salt
            var password = user.password
            var ciphertext = helpers.encryptionPasswd(oldPasswd, salt)
            if (ciphertext === password) {
                var salt = helpers.getRandomString(6)
                var ciphertext = helpers.encryptionPasswd(newPasswd, salt)
                user.password = ciphertext
                user.salt = salt
                yield user.save()
                return true
            } else {
                //Record number of errors
                yield MiniUserMeta.updatePasswordErrorTimes(user.id)
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
