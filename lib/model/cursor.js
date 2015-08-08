'use strict'
var helpers = require('../helpers')
    /**
     * database table minicloud_cursors CRUD
     */
var cursorModel = dbPool.cursorModel
    /**
     * Return cursor value
     * @param {String} cursor 
     * @return {Integer}    
     * @api public
     */
exports.getValueByCursor = function*(cursor) {
        if (cursor == '') return 0
        var cursorItems = yield cursorModel.coFind({
            cursor: cursor
        })
        if (cursorItems.length == 0) {
            return 0
        }
        return cursorItems[0].value
    }
    /**
     * Create cursor
     * @param {Integer} value
     * @return {Object}    
     * @api public
     */
exports.create = function*(value) {
    return yield cursorModel.coCreate({
        cursor: helpers.getRandomString(64),
        value: value
    })
}
