'use strict'
/**
 * database table minicloud_group_relations CRUD
 */
var userDepartmentRelationModel = dbPool.userDepartmentRelationModel
    /**
     * Create department-user relation
     * 
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.create = function*(departmentId, userId) {
        var relationList = yield userDepartmentRelationModel.coFind({
            department_id: departmentId,
            user_id: userId
        })
        if (relationList.length == 0) {
            var relation = yield userDepartmentRelationModel.coCreate({
                user_id: userId,
                department_id: departmentId
            })
        } else {
            var relation = relationList[0]
        }
        return relation
    }
    /**
     * Remove department-user relation
     * 
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.remove = function*(departmentId, userId) {
    var countConditon,condition = {
        department_id: departmentId,
        user_id: userId
    }
    if(global.oldVersion){
        countConditon = {
            group_id:departmentId,
            user_id:userId
        }
    }
    var count = yield userDepartmentRelationModel.coCount(countConditon)
    if (count > 0) {
        yield userDepartmentRelationModel.find(condition).remove().coRun()
    }
}

/**
 * get department-user relation list by departmentId
 * @param {Integer} departmentId
 * @return [Array]   
 * @api public
 */
exports.getAllByDepartmentId = function*(departmentId) {
    var relationList = yield userDepartmentRelationModel.coFind({
        department_id: departmentId
    })
    return relationList
}
