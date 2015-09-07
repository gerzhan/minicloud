var path = require('path')
var helpers = require('../helpers')
var fileHelpers = require('../file-helpers')
var ConflictFile = require('./conflict-file').ConflictFile
var MiniFileMeta = require('./file-meta')
var MiniVersion = require('./version')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel

function MiniFileList() {

}
/**
 * return folder list
 * @param {Object} device
 * @param {Object} file
 * @param {String} cursor
 * @param {Integer} limit
 * @return {Array}
 */
MiniFileList.prototype.getList = function*(device, file, cursor, limit) {
    var parentId = -1
    if (file) {
        parentId = file.id
    }
    var order = 'id desc'
    var conditons = {
            user_id: device.user_id,
            parent_id: parentId
        }
        //pagination
    var page = yield helpers.simplePage(fileModel, conditons, limit, cursor, order)
        //Assembled data
    var data = {
        has_more: page.has_more,
        cursor: page.cursor,
        count: page.count
    }
    var files = []
    for (var i = 0; i < page.items.length; i++) {
        var item = page.items[i]
        files.push(item)
    }
    data.files = files
    return data
}
exports.MiniFileList = MiniFileList
