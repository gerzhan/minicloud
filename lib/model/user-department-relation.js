'use strict'
/**
 * database table minicloud_group_relations CRUD
 */
var userDepartmentRelationModel = dbPool.userGroupRelationModel
    /**
     * Create group-user relation
     * 
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.create = function*(departmentId, userId) {
        var relationList = yield userDepartmentRelationModel.coFind({
            group_id: departmentId,
            user_id: userId
        })
        if (relationList.length == 0) {
            var relation = yield userDepartmentRelationModel.coCreate({
                user_id: userId,
                group_id: departmentId
            })
        } else {
            var relation = relationList[0]
        }
        return relation
    }
    /**
     * judge  group-user relation exist
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @return [Boolean]   
     * @api public
     */
exports.exist = function*(departmentId, userId) {
        var relationList = yield userDepartmentRelationModel.coFind({
            group_id: departmentId,
            user_id: userId
        })
        return relationList.length > 0
    }
    /**
     * get group-user relation list by departmentId
     * @param {Integer} departmentId
     * @return [Array]   
     * @api public
     */
exports.getAllByDepartmentId = function*(departmentId) {
        var relationList = yield userDepartmentRelationModel.coFind({
            group_id: departmentId
        })
        return relationList
    }
    /**
     * remove member-group relation 
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @api public
     */
exports.remove = function*(departmentId, userId) {
        yield userDepartmentRelationModel.find({
            group_id: departmentId,
            user_id: userId
        }).remove().coRun()
    }
    /**
     * remove all member-group relation 
     * @param {Integer} departmentId
     * @api public
     */
exports.removeAllByDepartmentId = function*(departmentId) {
    yield userDepartmentRelationModel.find({
        group_id: departmentId
    }).remove().coRun()
}
