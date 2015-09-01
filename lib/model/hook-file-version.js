var MiniVersionMeta = require('./version-meta')
var co = require('co')
    /**
     * database table minicloud_file_versions CRUD
     */
var versionModel = sequelizePool.versionModel
    /**
     * create file version meta and destory session
     * @param {Object} version
     * @param {Object} session  
     * @api private
     */
var createFileVersionMeta = function*(version, session) {
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
            yield createFileVersionMeta(version, options.session)
        })()
    })
}
exports.run = hook
