/**
 * database table minicloud_file_metas CRUD
 */
var fileMetaModel = sequelizePool.fileMetaModel

//set hook
fileMetaModel.hook('afterFind', function(meta, options) {
    unserializeValue(meta)
})
var unserializeValue = function(meta) {
        if (meta) {
            var key = meta.key
            if (key === 'versions') {
                meta.versions = JSON.parse(meta.value)
            }
        }
    }
    /**
     * add new version 
     * @param {Object} file 
     * @param {Object} version
     * @param {Object} device
     * @return {Object}   
     * @api public
     */
var addVersion = function*(file, version, device) {
        var filePath = file.path_lower
        var newItem = {
            hash: version.hash,
            device_id: device.id,
            time: new Date().getTime()
        }
        var key = 'versions'
        var meta = yield fileMetaModel.findOne({
                where: {
                    path: filePath,
                    key: key
                }
            })
            //set new versions
        var versions = []
        if (meta) {
            versions = meta.versions
        }
        versions.splice(0, 0, newItem)
        var newValue = JSON.stringify(versions)
        if (!meta) {
            meta = yield fileMetaModel.create({
                path: filePath,
                key: key,
                value: newValue
            })
        } else {
            meta.value = newValue
            meta = yield meta.save()
        }
        meta.versions = versions
        return meta
    }
    /**
     * return meta by file path 
     * @param {String} filePath
     * @param {String} key 
     * @return {Object}   
     * @api public
     */
var getByKey = function*(filePath, key) {
        return yield fileMetaModel.findOne({
            where: {
                path: filePath,
                key: key
            }
        })
    }
    /**
     * update meta path
     * @param {String} oldPath
     * @param {Object} file 
     * @return {Object}   
     * @api public
     */
var updatePath = function*(oldPath, file) {
    return yield fileMetaModel.update({
        path: file.path_lower
    }, {
        where: {
            path: oldPath
        }
    })
}
exports.addVersion = addVersion
exports.getByKey = getByKey
exports.updatePath = updatePath
