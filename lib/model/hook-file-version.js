var MiniVersionMeta = require('./version-meta')
var MiniUser = require('./user')
var co = require('co')
var path = require('path')
    /**
     * database table minicloud_file_versions CRUD
     */
var versionModel = sequelizePool.versionModel
    /**
     * create file version meta and destory session
     * @param {Object} version
     * @param {Object} options  
     * @api private
     */
var createVersionMeta = function*(version, options) {
    options = options || {}
    var session = options.session
    if (session) {
        var storeNodeId = session.store_node_id
            //-1 the minicloud self
        if (storeNodeId > -1) {
            yield MiniVersionMeta.create(version.id, 'store_id', storeNodeId)
        }
        yield session.destroy()
    }
}
var hook = function() {
    versionModel.hook('afterCreate', function(version, options) {
        return co.wrap(function*() {
            yield createVersionMeta(version, options.context)
        })()
    })
    versionModel.hook('beforeDestroy', function(version, options) {
        return co.wrap(function*() {
            yield MiniVersionMeta.removeAllByVersionId(version.id)
        })()
    })
}
exports.run = hook
