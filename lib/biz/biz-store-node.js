'use strict'
/**
 * store node biz
 */
var MiniStoreNode = require('../model/store-node')
var MiniOption = require('../model/option')
var webHelpers = require('../web-helpers')
    /**
     * return default upload/download node
     * @return String  
     * @api public
     */
exports.getDefaultHost = function*(app) {
        var option = yield MiniOption.getByKey('minicloud_host') 
        if (option) {
            return option.value
        }
        return webHelpers.getMiniHost(app)
    }
    /**
     * return best upload node
     * @return {Object}  
     * @api public
     */
exports.getUploadBestNode = function*() {
    var nodes = yield MiniStoreNode.getEnableList()
    var bestNode = null
    var saveFileCount = 0
    if (nodes.length > 0) {
        bestNode = nodes[0]
        saveFileCount = bestNode.saved_file_count
    }
    for (var i = 1; i < nodes.length; i++) {
        var node = nodes[i]
        if (saveFileCount > node.saved_file_count) {
            bestNode = node
        }
    } 
    return bestNode
}
