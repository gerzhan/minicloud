/**
 * Module dependencies.
 */
var BizPlugin = require('../../../biz/biz-plugin')
var BizStoreNode = require('../../../biz/biz-store-node')
var webHelpers = require('../../../web-helpers')
    /**
     *Such as the use of minicloud-store, you need to call this interface to obtain the most efficient server for online minicloud storage node.default minicloud-storage off. 
     *@api public
     */
exports.getStoreServer = function*() {
        var plugins = yield BizPlugin.getPluginEnabledList()
        if (plugins.miniStore) { 
            //The system has opened up a mini storage plug-in. The miniCloud will support distributed file storage, and the optimal storage node can be obtained by the following interface.
            var serverNode = yield BizStoreNode.getUploadBestNode()
            if (serverNode) {
                this.filter = 'host'
                this.body = serverNode
                return
            } else { 
                webHelpers.throw409(this, 'no_valid_minicloud_store_node', 'no valid minicloud store node.')
                return
            }
        }
        this.body = {host:yield BizStoreNode.getDefaultHost(this)}
    }
    /**
     * By file content sha-256 code, If the code exists, create file meta,file upload successfully.
     * @api public
     */
exports.second = function*() {

    }
    /**
     * file upload
     * @api public
     */
exports.upload = function*() {

    }
    /**
     * file upload
     * @api public
     */
exports.append = function*() {

    }
    /**
     * file upload
     * @api public
     */
exports.finish = function*() {

}
