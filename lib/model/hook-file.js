var helpers = require('../helpers')
var MiniVersion = require('./version')
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
            //change version_id
            var changedVersionId = file.changed('version_id')
            if (changedVersionId) {
                yield versionAddRefCount(file)
            }
        })()
    })
    fileModel.hook('afterCreate', function(file, options) {
        return co.wrap(function*() {
            yield versionAddRefCount(file)
        })()
    })

}
exports.run = hook
