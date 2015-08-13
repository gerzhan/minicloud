'use strict'
/**
 * database table minicloud_tags CRUD
 */
var tagModel = dbPool.tagModel
var co = require('co')
tagModel.beforeRemove(function(next) {
        var MiniFileTagRelation = require('./file-tag-relation')
        var tagId = this.id
        co.wrap(function*() {
            yield MiniFileTagRelation.removeAllByTagId(tagId)
        })()
        return next()
    })
  /**
     * Create a tag
     * @param {Integer} userId
     * @param {String} name
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, name) {
    var tag = yield tagModel.coCreate({
        user_id: userId,
        name: name
    })
    return tag
}
/**
 * exist tag or not
 * @param {Integer} userId
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(userId, name) {
    var tagList = yield tagModel.coFind({
        user_id: userId,
        name: name
    })
    return tagList.length > 0
}

/**
 * find tag by userId
 * @param {Integer} userId 
 * @return [Array]
 * @api public
 */
exports.getAllByUserId = function*(userId) {
    var tagList = yield tagModel.coFind({
        user_id: userId
    })
    return tagList

}

/**
 * find tag by userId and name
 * @param {Integer} userId 
 * @param {String} name 
 * @return {Object}
 * @api public
 */
exports.getByName = function*(userId, name) {
        var tagList = yield tagModel.coFind({
            user_id: userId,
            name: name
        })
        if (tagList.length > 0) {
            return tagList[0]
        }
        return null
    }