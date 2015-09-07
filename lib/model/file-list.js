var path = require('path')
var helpers = require('../helpers')
var fileHelpers = require('../file-helpers')
var ConflictFile = require('./conflict-file').ConflictFile
var MiniFileMeta = require('./file-meta')
var MiniVersion = require('./version')
var MiniFileCore = require('./file-core').MiniFileCore
var miniFileCore = new MiniFileCore()
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel

function MiniFileList() {

}
MiniFileList.prototype._do2vo = function*(file) {
        var fullFile = yield miniFileCore.getFullFile(file)
        if (fullFile.type === 0) {
            return {
                tag: 'file',
                name: fullFile.name,
                path_lower: fullFile.path_lower,
                client_modified: fullFile.client_modified,
                server_modified: fullFile.updated_at,
                hash: fullFile.hash,
                size: fullFile.size
            }
        }
        return {
            tag: 'folder',
            name: fullFile.name,
            path_lower: fullFile.path_lower
        }
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
        files.push(yield this._do2vo(item))
    }
    data.files = files
    return data
}
exports.MiniFileList = MiniFileList
