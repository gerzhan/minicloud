'use strict'
var S = require('string')
    /**
     * database table minicloud_users CRUD
     */
var userModel = sequelizePool.userModel
var helpers = require('../helpers')
var MiniUserMeta = require('./user-meta')
var MiniDepartment = require('./department')
var uuid = require('uuid')
var S = require('string')
var co = require('co')
var normalizeName = function(name, replaceKey) {
        var NAME_KEY = '-'
        if (typeof(replaceKey) !== 'undefined') {
            NAME_KEY = replaceKey
        }
        var sKeys = [':', '\\', ':', '*', '?', '"', '<', '>', '|', ',', '/']
        for (var i = 0; i < sKeys.length; i++) {
            name = S(name).replaceAll(sKeys[i], NAME_KEY).s
        }
        return name
    }
    /**
     * beforeCreate hook
     * @param {Object} user 
     * @param {Object} options 
     * @return null 
     * @api private
     */
userModel.hook('beforeCreate', function(user, options) {
        user.name = normalizeName(user.name)
    })
    /**
     * beforeDestroy hook
     * @param {Object} user 
     * @param {Object} options 
     * @return null 
     * @api private
     */
userModel.hook('beforeDestroy', function(user, options) { 
        var MiniDevice = require('./device') 
        var MiniEvent = require('./event') 
        var MiniFile = require('./file') 
        var MiniGroup = require('./group') 
        var MiniTag = require('./tag') 
        var MiniUserMeta = require('./user-meta') 
        //TODO remove file_links
        co.wrap(function*() { 
            yield MiniDevice.removeAllByUserId(user.id) 
            yield MiniUserMeta.removeAllByUserId(user.id) 
            yield MiniEvent.removeAllByUserId(user.id) 
            yield MiniFile.removeAllByUserId(user.id) 
            yield MiniGroup.removeAllByUserId(user.id) 
            yield MiniTag.removeAllByUserId(user.id)             
        })()
    })
    /**
     * dataobject convert to view object 
     * @param {Object} user  
     * @return {Object}   
     * @api private
     */
var _do2vo = function*(user) {
        var user = yield _getFullUser(user)
        return {
            metas: user.metas,
            name: user.name,
            uuid: user.uuid,
            status: user.status,
            role: user.role,
            total_space: 1024,
            used_space: 512,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    }
    /**
     * page list convert to view object page list
     * @param {Object} page  
     * @return {Object}   
     * @api private
     */
var _list2vo = function*(page) {
        //Assembled data
        var data = {
            has_more: page.has_more,
            cursor: page.cursor,
            count: page.count
        }
        var users = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            users.push(yield _do2vo(item))
        }
        data.users = users
        return data
    }
    /**
     * Keyword search for users that the user list synchronization support paging. Such as keyword is empty it means the user list.
     * @param {String} key
     * @param {Integer} limit
     * @param {String} cursor
     * @return {Object}   
     * @api private
     */
var _simplePageUser = function*(key, limit, cursor) {
        var order = 'id asc'
        var conditons = {}
        if (key) {
            conditons.detail = {
                $like: '%' + key + '%'
            }
        }
        //pagination
        var page = yield helpers.simplePage(userModel, conditons, limit, cursor, order)
        return yield _list2vo(page)
    }
    /**
     * set user metas
     * @param {Object} user
     * @return {Object}  
     * @api private
     */
var _getFullUser = function*(user) {
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
        return yield _getFullUser(user)
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
    if (user) {
        return yield _getFullUser(user)
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
exports.create = function*(name, password, role) {
        role = role || COMMON_USER
        var user = yield userModel.findOne({
            where: {
                name: name
            }
        })
        var salt = helpers.getRandomString(6)
        var ciphertext = helpers.encryptionPasswd(password, salt)
        if (!user) {
            var user = yield userModel.create({
                uuid: uuid.v4(),
                name: name,
                password: ciphertext,
                status: 1,
                salt: salt,
                role: role
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
            where: {
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
     * set use status
     * @param {String} uuid
     * @param {Boolean} is_enabled
     * @return {Boolean}   
     * @api public
     */
exports.setStatus = function*(uuid, isEnabled) {
    var user = yield userModel.findOne({
        where: {
            uuid: uuid
        }
    })
    if (user) {
        user.status = isEnabled
        user = yield user.save()
    }
    return user
}

/**
 * Get users list 
 * @param {Integer} limit
 * @param {String} cursor
 * @return {Object}   
 * @api public
 */
exports.list = function*(limit, cursor) {
        return yield _simplePageUser(null, limit, cursor)
    }
    /**
     * Get users page list 
     * @param {Integer} page
     * @param {Integer} limit
     * @param {Object} conditions
     * @param {Object} orderRules
     * @return {Object}   
     * @api public
     */
exports.pageList = function*(page, limit, conditions, orderRules) {
        //pagination 
        var page = yield helpers.simplePageList(userModel, page, limit, conditions, orderRules)
            //Assembled data        
        var users = []
        for (var i = 0; i < page.items.length; i++) {
            var item = page.items[i]
            users.push(yield _do2vo(item))
        }
        var data = {
            count: page.count,
            users: users
        }
        return data
    }
    /**
     * Search user
     * @param {String} key
     * @param {Integer} limit
     * @param {String} cursor
     * @return {Object}   
     * @api public
     */
exports.search = function*(key, limit, cursor) {
        key = normalizeName(key, '')
        return yield _simplePageUser(key, limit, cursor)
    }
    /**
     * Bind user to deparment
     * @param {Integer} id
     * @param {String} departmentPath
     * @api public
     */
exports.bindUserToDepartment = function*(id, departmentPath) {
        var user = yield userModel.findById(id)
        user.department_path = departmentPath
        yield user.save()
    }
    /**
     * UnBind user to deparment
     * @param {Integer} id
     * @param {String} departmentPath
     * @api public
     */
exports.unbindUserToDepartment = function*(id, departmentPath) {
        var user = yield userModel.findById(id)
        user.department_path = null
        yield user.save()
    }
    /**
     * get user list by deparment path
     * @param {String} departmentPath
     * @api public
     */
exports.getListByDepartmentPath = function*(departmentPath) {
        return yield userModel.findAll({
            where: {
                department_path: departmentPath
            }
        })
    }
    /**
     * get one department's user descendants by deparmentId
     * @param {String} departmentId
     * @api public
     */
exports.getDescendants = function*(departmentPath, limit, cursor, conditionKey, conditionAdmin, conditionDisabled) {
        var order = 'id asc'
        var conditons = {}
        var department = yield MiniDepartment.getByPath(departmentPath)
        conditons.department_path = {
            $like: departmentPath + '%'
        }
        if (conditionKey) {
            conditons.detail = {
                $like: '%' + conditionKey + '%'
            }
        }
        if (conditionAdmin === true) {
            conditons.role = {
                $gt: 1
            }
        }
        if (conditionDisabled === true) {
            conditons.status = 0
        }
        var page = yield helpers.simplePage(userModel, conditons, limit, cursor, order)
        return yield _list2vo(page)
    }
    /**
     * return user ids  by deparment path
     * @param {String} departmentPath
     * @api public
     */
exports.getIdsByDepartmentPath = function*(departmentPath) {
    var order = 'id asc'
    var userList = yield userModel.findAll({
        where: {
            department_path: {
                $like: departmentPath + '%'
            }
        },
        order: order
    })
    var userIds = []

    for (var i = 0; i < userList.length; i++) {
        var user = userList[i]
        userIds.push(user.id)
    }
    return userIds
}
