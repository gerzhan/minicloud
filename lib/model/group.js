'use strict'
/**
 * database table minicloud_groups CRUD
 */
var groupModel = sequelizePool.groupModel
var co = require('co')
var S = require('string')
var normalizeName = function(name) {
        var NAME_KEY = '-'
        var sKeys = [':', '\\', ':', '*', '?', '"', '<', '>', '|', ',', '/']
        for (var i = 0; i < sKeys.length; i++) {
            name = S(name).replaceAll(sKeys[i], NAME_KEY).s
        }
        return name
    }
    //set hook 
groupModel.hook('beforeDestroy', function(group, options) {
    var MiniUserGroupRelation = require('./user-group-relation')
    var groupId = group.id
    co.wrap(function*() {
        yield MiniUserGroupRelation.removeAllByGroupId(groupId)
        return next()
    })()
})
groupModel.hook('beforeCreate', function(group, options) {
    group.name = normalizeName(group.name)
})
groupModel.hook('beforeUpdate', function(group, options) {
        group.name = normalizeName(group.name)
    })
    /**
     * Create group
     * @param {Integer} userId
     * @param {String} name
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, name) {
    return yield groupModel.create({
        user_id: userId,
        name: name,
        description: '',
        parent_group_id: -1

    })
}


/**
 * exist group or not
 * @param {Integer} userId
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(userId, name) {
    var count = yield groupModel.count({
        where: {
            user_id: userId,
            name: name
        }
    })
    return count > 0
}

/**
 * find group by userId
 * @param {Integer} userId 
 * @return [Array]
 * @api public
 */
exports.getAllByUserId = function*(userId) {
    return yield groupModel.findAll({
        where: {
            user_id: userId
        }
    })

}

/**
 * find group by userId and name
 * @param {Integer} userId 
 * @param {String} name 
 * @return {Object}
 * @api public
 */
exports.getByName = function*(userId, name) {
        return yield groupModel.findOne({
            where: {
                user_id: userId,
                name: name
            }
        })
    }
    /**
     * rename group by userId and name
     * @param {Integer} userId 
     * @param {String} oldName 
     * @param {String} newName 
     * @return {Boolean}
     * @api public
     */
exports.rename = function*(userId, oldName, newName) {
    var group = yield groupModel.findOne({
        where: {
            user_id: userId,
            name: oldName
        }
    })
    if (group) {
        group.name = newName
        yield group.save()
        return true
    }
    return false
}
