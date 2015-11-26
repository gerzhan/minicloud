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
    fileModel.hook('beforeDestroy', function(file, options) {
            var MiniFileLink = require('./file-link')
            var MiniFileTagRelation = require('./file-tag-relation')
            return co.wrap(function*() {
                //delete from file meta
                yield MiniFileMeta.removeAllByFilePath(file.path_lower)
                //delete from file link
                yield MiniFileLink.removeAllByFileId(file.id)
                //delete from file-tag-relation
                yield MiniFileTagRelation.removeAllByFileId(file.id)
                //minus version refCount
                yield MiniVersion.minusRefCount(file.version_id)
                //TODO remove chooser
                //TODO remove group_provileges
            })()
        })
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
                    var version = yield MiniVersion.getById(file.version_id)
                    yield MiniFileMeta.addRev(file, version, options.context.device)
                }
                //change file meta show_lower
                var changedPath = file.changed('path_lower')
                if (changedPath) {
                    var oldPath = file.previous('path_lower')
                    yield MiniFileMeta.updatePath(oldPath, file)
                }
            }
            var changedPath = file.changed('path_lower')
            if (changedPath) {
                //create event
                var context = options.context
                yield MiniEvent.createFileMoveEvent(context.ip, context.device, file)
            }
        })()
    })
    fileModel.hook('afterCreate', function(file, options) {
        return co.wrap(function*() {
            var context = options.context
            if (file.type === 0) {
                yield versionAddRefCount(file)
                yield MiniFileMeta.addRev(file, context.version, context.device)
            }
            //create event
            yield MiniEvent.createNewFileEvent(context.ip, context.device, file)
        })()

    })
    fileModel.hook('afterBulkUpdate', function(options) {
        //bulkupdate create event   When is_deleted attribute is 1,the hook work
        if (options.attributes.is_deleted===1) {
            return co.wrap(function*() {
                var context = options.context
                var conditions = options.where
                    //get effect items count
                conditions.is_deleted = 1
                var fakeDeleteCount = yield fileModel.count({
                    where: conditions
                })
                var file = yield fileModel.findOne({
                    where: conditions
                })
                yield MiniEvent.createFileFakeDeleteEvent(context.ip, context.device, file, fakeDeleteCount)
            })()
        }
    })
}
exports.run = hook
