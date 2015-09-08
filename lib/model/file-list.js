var helpers = require('../helpers')
var MiniFileCore = require('./file-core').MiniFileCore
var miniFileCore = new MiniFileCore()
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
MiniFileList.prototype.getList = function*(conditons, cursor, limit) {
    var order = 'id desc'
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
        files.push(yield miniFileCore.getFullFile(item))
    }
    data.files = files
    return data
}
exports.MiniFileList = MiniFileList
