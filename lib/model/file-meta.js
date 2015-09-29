var MiniUser = require('./user')
var MiniDevice = require('./device')
    /**
     * database table minicloud_file_metas CRUD
     */
var fileMetaModel = sequelizePool.fileMetaModel

/**
 * add new version 
 * @param {Object} file 
 * @param {Object} version
 * @param {Object} device
 * @return {Object}   
 * @api public
 */
var addRev = function*(file, version, device) {
        var filePath = file.path_lower
        var newItem = {
            hash: version.hash,
            device_id: device.id,
            device_name: device.name,
            client_id: device.client_id,
            user_id: device.user_id,
            created_at: new Date().getTime()
        }
        var key = 'revs'
        var meta = yield fileMetaModel.findOne({
                where: {
                    path: filePath,
                    key: key
                }
            })
            //set new versions
        var revs = []
        if (meta) {
            revs = JSON.parse(meta.value)
        }
        revs.push(newItem)
        var newValue = JSON.stringify(revs)
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
    /**
     * return file revs
     * @param {String} oldPath
     * @param {Object} file 
     * @return {Object}   
     * @api public
     */
var getRevs = function*(filePath) {
    var meta = yield getByKey(filePath, 'revs')
    var data = []
    if (meta) {
        var value = JSON.parse(meta.value)
        revs = value.reverse()
        for (var i = 0; i < revs.length; i++) {
            var rev = revs[i]
            var user = yield MiniUser.getById(rev.user_id)
            var device = yield MiniDevice.getById(rev.device_id)
            var deviceName = rev.device_name
            var clientId = rev.client_id
            if (device) {
                deviceName = device.name
                clientId = device.client_id
            }
            if (user) {
                var item = {
                    hash: rev.hash,
                    user: {
                        name: user.name,
                        uuid: user.uuid,
                        metas: user.metas
                    },
                    device: {
                        name: deviceName,
                        client_id: clientId
                    },
                    created_at:rev.created_at
                }
                data.push(item)
            }
        }
    }
    return data
}
exports.addRev = addRev
exports.getRevs = getRevs
exports.getByKey = getByKey
exports.updatePath = updatePath
