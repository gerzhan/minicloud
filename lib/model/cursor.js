'use strict'
var helpers = require('../helpers')
    /**
     * database table minicloud_cursors CRUD
     */
var cursorModel = sequelizePool.cursorModel
    /**
     * Return cursor value
     * @param {String} cursor 
     * @return {Integer}    
     * @api public
     */
exports.getValueByCursor = function*(cursor) {
        if (cursor == '') return 0
        var cursor = yield cursorModel.findOne({
            where: {
                cursor: cursor
            }
        })
        if(cursor){
            return cursor.value
        }
        return 0
    }
    /**
     * Create cursor
     * @param {Integer} value
     * @return {Object}    
     * @api public
     */
exports.create = function*(value) {
    return yield cursorModel.create({
        cursor: helpers.getRandomString(64),
        value: value
    })
}
