'use strict'
/**
 * database table miniyun_group_relations CRUD
 */
var userGroupRelationModel = dbPool.userGroupRelationModel
    /**
     * Create group-user relation
     * 
     * @param {Integer} groupId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.create = function*(groupId, userId) {
        var relationList = yield userGroupRelationModel.coFind({
            group_id: groupId,
            user_id: userId
        })
        if (relationList.length == 0) {
            var relation = yield userGroupRelationModel.coCreate({
                user_id: userId,
                group_id: groupId
            })
        } else {
            var relation = relationList[0]           
        }
        return relation
    }
    /**
     * judge  group-user relation exist
     * @param {Integer} groupId
     * @param {Integer} userId
     * @return [Boolean]   
     * @api public
     */
exports.exist = function*(groupId, userId) {
        var relationList = yield userGroupRelationModel.coFind({
            group_id: groupId,
            user_id: userId
        })
        return relationList.length>0
    }
    /**
     * get group-user relation list by groupId
     * @param {Integer} groupId
     * @return [Array]   
     * @api public
     */
exports.getAllByGroupId = function*(groupId) {
    var relationList = yield userGroupRelationModel.coFind({
        group_id: groupId
    })
    return relationList
}
