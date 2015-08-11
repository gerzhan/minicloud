'use strict'
/**
 * database table minicloud_groups CRUD
 */
var groupModel = dbPool.groupModel
var co = require('co')
    //set hook
groupModel.beforeRemove(function(next) {
        var MiniUserGroupRelation = require('./user-group-relation')
        var groupId = this.id
        co.wrap(function*() {
            yield MiniUserGroupRelation.removeAllByGroupId(groupId)
        })()
        return next()
    })
    /**
     * Create group
     * @param {Integer} userId
     * @param {String} name
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, name) {
    var group = yield groupModel.coCreate({
        user_id: userId,
        name: name,
        description: '',
        parent_group_id: -1

    })
    return group
}


/**
 * exist group or not
 * @param {Integer} userId
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(userId, name) {
    var groupList = yield groupModel.coFind({
        user_id: userId,
        name: name
    })
    return groupList.length > 0
}

/**
 * find group by userId
 * @param {Integer} userId 
 * @return [Array]
 * @api public
 */
exports.getAllByUserId = function*(userId) {
    var groupList = yield groupModel.coFind({
        user_id: userId
    })
    return groupList

}

/**
 * find group by userId and name
 * @param {Integer} userId 
 * @param {String} name 
 * @return {Object}
 * @api public
 */
exports.getByName = function*(userId, name) {
    var groupList = yield groupModel.coFind({
        user_id: userId,
        name: name
    })
    if (groupList.length > 0) {
        return groupList[0]
    }
    return null
}
