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
        var fileId = file.id
        var newItem = {
            hash: version.hash,
            device_id: device.id,
            time: new Date().getTime()
        }
        var key = 'versions'
        var meta = yield fileMetaModel.findOne({
                where: {
                    file_id: fileId,
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
                file_id: fileId,
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
     * return meta by fileId 
     * @param {Integer} fileId
     * @param {String} key 
     * @return {Object}   
     * @api public
     */
var getByKey = function*(fileId, key) {
    return yield fileMetaModel.findOne({
        where: {
            file_id: fileId,
            key: key
        }
    })
}
exports.addVersion = addVersion
exports.getByKey = getByKey
