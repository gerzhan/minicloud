var helpers = require('../helpers')
var fileHelpers = require('../file-helpers')
var MiniVersion = require('./version')
var MiniEvent = require('./event')
var MiniFileMeta = require('./file-meta')
var co = require('co')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel
    /**
     * update file pinyin set to hook
     * @param {Object} file  
     * @api private
     */
var updatePinyin = function*(file) {
        var name = file.name
        name = name.toLowerCase()
        file.file_name_pinyin = helpers.getPinyin(name)
    }
    /**
     * update version ref_count++
     * @param {Object} file  
     * @api private
     */
var versionAddRefCount = function*(file) {
    if (file.type === 0) {
        yield MiniVersion.addRefCount(file.version_id)
    }
}
var hook = function() {
    //set hook
    fileModel.hook('beforeCreate', function(file, options) {
            return co.wrap(function*() {
                yield updatePinyin(file)
            })()
        })
        //set hook
    fileModel.hook('beforeUpdate', function(file, options) {
        return co.wrap(function*() {
            //change name
            var changedName = file.changed('name')
            if (changedName) {
                yield updatePinyin(file)
            }
        })()
    })
    fileModel.hook('afterUpdate', function(file, options) {
        return co.wrap(function*() {
            if (file.type === 0) {
                //change version_id
                var changedVersionId = file.changed('version_id')
                if (changedVersionId) {
                    yield versionAddRefCount(file)
                }
            }
        })()
    })
    fileModel.hook('afterCreate', function(file, options) {
        return co.wrap(function*() {
            if (file.type === 0) {
                yield versionAddRefCount(file)
                yield MiniFileMeta.addVersion(file, options.version, options.device)
            }
        })()
    })
    fileModel.hook('afterBulkUpdate', function(options) {
        //bulkupdate     When is_deleted attribute is true,the hook work
        if (options.attributes.is_deleted) {
            return co.wrap(function*() {
                var userId = options.where.user_id
                var fileList = yield fileModel.findAll({
                    where: {
                        user_id: userId,
                        is_deleted: true,
                        path_lower: options.where.file_path
                    }
                })
                var file = yield fileModel.findOne({
                    where: {
                        user_id: userId,
                        path_lower: fileHelpers.lowerPath(userId, options.context.path)
                    }
                })
                yield MiniEvent.createFakeDeleteEvent(userId, options.context.device, options.context.ip, fileList.length, file)
            })()
        }
    })
}
exports.run = hook
