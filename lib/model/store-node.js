'use strict'
/**
 * database table minicloud_store_nodes CRUD
 */
var storeNodeModel = sequelizePool.storeNodeModel
    /**
     * create strage node server
     * @return {Object}  
     * @api public
     */
exports.create = function*(name, host, safeCode) {
        var node = yield storeNodeModel.findOne({
            where: {
                name: name
            }
        })
        if (!node) {
            node = yield storeNodeModel.create({
                name: name,
                host: host,
                safe_code: safeCode,
                status: 0,
                saved_file_count: 0,
                downloaded_file_count: 0
            })
        } else {
            node.host = host
            node.safe_code = safeCode
            node = yield node.save()
        }
        return node
    }
    /**
     * set node status 
     * @api public
     */
exports.setStatus = function*(name, status) {
        var node = yield storeNodeModel.findOne({
            where: {
                name: name
            }
        })
        if (node) {
            node.status = status
            yield node.save()
        }
    }
    /**
     * get enable nodes
     * @return {Array}  
     * @api public
     */
var getEnableList = function*() {
        return yield storeNodeModel.findAll({
            where: {
                status: 1
            }
        })
    }
    /**
     * return best download node by id
     * @return {Object}  
     * @api public
     */
exports.getDownloadBestNode = function*(ids) {
        ids = ids.split(',')
        var nodes = yield storeNodeModel.findAll({
            where: {
                id: {
                    $in: ids
                }
            }
        })
        var bestNode = null
        var downloadFileCount = 0
        if (nodes.length > 0) {
            bestNode = nodes[0]
            downloadFileCount = bestNode.downloaded_file_count
        }
        for (var i = 1; i < nodes.length; i++) {
            var node = nodes[i]
            if (downloadFileCount > node.downloaded_file_count) {
                bestNode = node
            }
        }
        if (bestNode) {
            bestNode.downloaded_file_count += 1
            yield bestNode.save()
        }
        return bestNode
    }
    /**
     * return best upload node
     * @return {Object}  
     * @api public
     */
exports.getUploadBestNode = function*() {
        var nodes = yield getEnableList()
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
    /**
     * set node save count 
     * @api public
     */
exports.setSaveCount = function*(name, saveCount) {
        var node = yield storeNodeModel.findOne({
            where: {
                name: name
            }
        })
        if (node) {
            node.saved_file_count = saveCount
            yield node.save()
        }
    }
    /**
     * set node download count 
     * @api public
     */
exports.setDownloadCount = function*(name, downloadCount) {
    var node = yield storeNodeModel.findOne({
        where: {
            name: name
        }
    })
    if (node) {
        node.downloaded_file_count = downloadCount
        yield node.save()
    }
}
