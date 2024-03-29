'use strict'
var uuid = require('uuid')
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
        return null
    }
    /**
     * Create cursor
     * @param {Integer} value
     * @return {Object}    
     * @api public
     */
exports.create = function*(value) {
    return yield cursorModel.create({
        cursor: uuid.v4(),
        value: value
    })
}
