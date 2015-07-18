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
        user_id: userId
    })
    if (relationList.length == 0) {
        var relation = yield userGroupRelationModel.coCreate({
            user_id: userId,
            group_id: groupId
        })
    } else {
        var relation = relationList[0];
        relation.group_id = groupId;
        relation = yield relation.coSave();
    }
    return relation
}
