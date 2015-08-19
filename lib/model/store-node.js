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
                status: false,
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
     * @return Boolean  
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
     * @return Boolean  
     * @api public
     */
exports.getEnableList = function*() {
        return yield storeNodeModel.findAll({
            where: {
                status: true
            }
        })
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
