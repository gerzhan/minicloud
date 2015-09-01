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
     * return session by session_id
     * @param {String} sessionId  
     * @return {Object}    
     * @api private
     */
var getBySessionId = function*(sessionId) {
    return yield fileUploadSessionModel.findOne({
        where: {
            session_id: sessionId
        }
    })
}
exports.create = create
exports.getBySessionId = getBySessionId