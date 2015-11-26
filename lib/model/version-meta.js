/**
 * database table minicloud_version_meta CRUD
 */
/**
 * Module dependencies.
 */
var versionMetaModel = sequelizePool.versionMetaModel
    /**
     * create file version meta
     * @param {Integer} versionId 
     * @param {String} key
     * @param {String} value
     * @return {Object}
     * @api private
     */
var create = function*(versionId, key, value) {
        value = value + ''
        var meta = yield versionMetaModel.findOne({
            where: {
                version_id: versionId,
                key: key
            }
        })
        if (!meta) {
            return yield versionMetaModel.create({
                version_id: versionId,
                key: key,
                value: value
            })
        } else {
            meta.value = value
            meta = yield meta.save()
        }
        return meta
    }
    /**
     * return file version meta
     * @param {Integer} versionId 
     * @param {String} key 
     * @return {Object}
     * @api private
     */
var getByKey = function*(versionId, key) {
        return yield versionMetaModel.findOne({
            where: {
                version_id: versionId,
                key: key
            }
        })
    }
    /**
     * remove  by versionId
     * @param {integer} versionId
     * @api public
     */
exports.removeAllByVersionId = function*(versionId) {
    yield versionMetaModel.destroy({
        where: {
            version_id: versionId
        }
    })
}
exports.create = create
exports.getByKey = getByKey
