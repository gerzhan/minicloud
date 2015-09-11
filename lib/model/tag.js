'use strict'
/**
 * database table minicloud_tags CRUD
 */
var tagModel = sequelizePool.tagModel
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
tagModel.hook('beforeDestroy', function(tag, options) {
    var MiniFileTagRelation = require('./file-tag-relation')
    var tagId = tag.id
    return co.wrap(function*() {
        yield MiniFileTagRelation.removeAllByTagId(tagId)
    })()
})
tagModel.hook('beforeCreate', function(tag, options) {
    tag.name = normalizeName(tag.name)
})
tagModel.hook('beforeUpdate', function(tag, options) {
        tag.name = normalizeName(tag.name)
    })
    /**
     * Create a tag
     * @param {Integer} userId
     * @param {String} name
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, name) {
        return yield tagModel.create({
            user_id: userId,
            name: name
        })
    }
    /**
     * exist tag or not
     * @param {Integer} userId
     * @param {String} name
     * @return {Boolean}  
     * @api public
     */
exports.exist = function*(userId, name) {
    var count = yield tagModel.count({
        where: {
            user_id: userId,
            name: name
        }
    })
    return count > 0
}

/**
 * find tag by userId
 * @param {Integer} userId 
 * @return [Array]
 * @api public
 */
exports.getAllByUserId = function*(userId) {
    return yield tagModel.findAll({
        where: {
            user_id: userId
        }
    })
}

/**
 * find tag by userId and name
 * @param {Integer} userId 
 * @param {String} name 
 * @return {Object}
 * @api public
 */
exports.getByName = function*(userId, name) {
    return yield tagModel.findOne({
        where: {
            user_id: userId,
            name: name
        }
    })
}

/**
 * rename tag by userId and name
 * @param {Integer} userId 
 * @param {String} oldName 
 * @param {String} newName 
 * @return {Boolean}
 * @api public
 */
exports.rename = function*(userId, oldName, newName) {
        var tag = yield tagModel.findOne({
            where: {
                user_id: userId,
                name: oldName
            }
        })
        if (tag) {
            tag.name = newName
            yield tag.save()
            return true
        }
        return false
    }
    /**
     * find tag by userId and tagId
     * @param {Integer} userId 
     * @param {Integer} tagId 
     * @return {Object}
     * @api public
     */
exports.getByTagId = function*(userId, tagId) {
    return yield tagModel.findById(tagId)
}
