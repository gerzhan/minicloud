var uuid = require('uuid')
    /**
     * database table minicloud_file_upload_session CRUD
     */

var fileUploadSessionModel = sequelizePool.fileUploadSessionModel 
    /**
     * create session
     * @param {Integer} stroreNodeId  
     * @return {Object}    
     * @api private
     */
var create = function*(stroreNodeId) {
        stroreNodeId = stroreNodeId || -1
        return yield fileUploadSessionModel.create({
            session_id: uuid.v4(),
            store_node_id: stroreNodeId
        })
    }
    /**
     * remove session
     * @param {String} sessionId  
     * @return {Object}    
     * @api private
     */
var remove = function*(sessionId) {
    return yield fileUploadSessionModel.destroy({
        where: {
            session_id: sessionId
        }
    })
}
exports.create = create
exports.remove = remove
