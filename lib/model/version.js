/**
 * database table minicloud_versions CRUD
 */
/**
 * Module dependencies.
 */
var versionModel = sequelizePool.versionModel
    /**
     * create file version
     * @param {String} hash 
     * @param {BigInt} size
     * @param {String} mime
     * @return {Object}
     * @api public
     */
exports.create = function*(hash, size, mime) {
        var version = yield versionModel.findOne({
            where: {
                hash: hash
            }
        })
        if (!version) {
            return yield versionModel.create({
                hash: hash,
                size: size,
                mime: mime,
                ref_count: 1,
                doc_convert_status: 0,
                replicate_status: 0
            })
        }
        return version
    }
    /**
     * return file version by hash
     * @param {String} hash 
     * @return {Object}
     * @api public
     */
exports.getByHash = function*(hash) {
        return yield versionModel.findOne({
            where: {
                hash: hash
            }
        })
    }
    /**
     * return file version by id
     * @param {Integer} id 
     * @return {Object}
     * @api public
     */
exports.getById = function*(id) {
        return yield versionModel.findById(id)
    }
    /**
     * add ref count
     * @param {Integer} id 
     * @return {Object}
     * @api public
     */
exports.addRefCount = function*(id) {
    var version = yield versionModel.findById(id)
    if (version) {
        version.ref_count = version.ref_count + 1
        return yield version.save()
    }
}
