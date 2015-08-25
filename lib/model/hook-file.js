var helpers = require('../helpers')
var co = require('co')
    /**
     * database table minicloud_files CRUD
     */
var fileModel = sequelizePool.fileModel
    /**
     * update file pinyin set to hook
     * @param {Object} file  
     * @api public
     */
var updatePinyin = function*(file) {
    var name = file.name
    name = name.toLowerCase()
    file.file_name_pinyin = helpers.getPinyin(name)
}
var hook = function() {
    //set hook
    fileModel.hook('beforeCreate', function(file, options) {
            co.wrap(function*() {
                yield updatePinyin(file)
            })()
        })
        //set hook
    fileModel.hook('beforeUpdate', function(file, options) {
        co.wrap(function*() {
            yield updatePinyin(file)
        })()
    })
}
exports.run = hook
