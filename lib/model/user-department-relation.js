'use strict'
/**
 * database table minicloud_group_relations CRUD
 */
var userDepartmentRelationModel = sequelizePool.userDepartmentRelationModel
    /**
     * Create department-user relation
     * 
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.create = function*(departmentId, userId) {
        var relation = yield userDepartmentRelationModel.findOne({
            where: {
                department_id: departmentId,
                user_id: userId
            }
        })
        if (!relation) {
            relation = yield userDepartmentRelationModel.create({
                user_id: userId,
                department_id: departmentId
            })
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
    yield userDepartmentRelationModel.destroy({
        where: {
            group_id: departmentId,
            user_id: userId
        }
    })
}

/**
 * get department-user relation list by departmentId
 * @param {Integer} departmentId
 * @return [Array]   
 * @api public
 */
exports.getAllByDepartmentId = function*(departmentId) {
    return yield userDepartmentRelationModel.findAll({
        where: {
            department_id: departmentId
        }
    }) 
}
