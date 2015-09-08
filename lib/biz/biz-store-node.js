'use strict'
/**
 * store node biz
 */
var MiniStoreNode = require('../model/store-node')
var MiniOption = require('../model/option')
var webHelpers = require('../web-helpers')
    /**
     * return default upload/download node
     * @param {Object} app
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
    return yield MiniStoreNode.getUploadBestNode() 
}
