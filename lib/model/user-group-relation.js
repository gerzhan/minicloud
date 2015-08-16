'use strict'
/**
 * database table minicloud_group_relations CRUD
 */
var userGroupRelationModel = sequelizePool.userGroupRelationModel
    /**
     * Create group-user relation
     * 
     * @param {Integer} groupId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.create = function*(groupId, userId) {
        var relation = yield userGroupRelationModel.findOne({
            where: {
                group_id: groupId,
                user_id: userId
            }
        })
        if (!relation) {
            relation = yield userGroupRelationModel.create({
                user_id: userId,
                group_id: groupId
            })
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
        var count = yield userGroupRelationModel.count({
            where: {
                group_id: groupId,
                user_id: userId
            }
        })
        return count > 0
    }
    /**
     * get group-user relation list by groupId
     * @param {Integer} groupId
     * @return [Array]   
     * @api public
     */
exports.getAllByGroupId = function*(groupId) {
        return yield userGroupRelationModel.findAll({
            where: {
                group_id: groupId
            }
        })
    }
    /**
     * remove member-group relation 
     * @param {Integer} groupId
     * @param {Integer} userId
     * @api public
     */
exports.remove = function*(groupId, userId) {
        yield userGroupRelationModel.destroy({
            where: {
                group_id: groupId,
                user_id: userId
            }
        })
    }
    /**
     * remove all member-group relation 
     * @param {Integer} groupId
     * @api public
     */
exports.removeAllByGroupId = function*(groupId) {
    yield userGroupRelationModel.destroy({
        where: {
            group_id: groupId
        }
    })
}
