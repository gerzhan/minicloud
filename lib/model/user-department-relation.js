'use strict'
/**
 * database table minicloud_group_relations CRUD
 */
var userDepartmentRelationModel = sequelizePool.userDepartmentRelationModel
var userModel = sequelizePool.userModel
var userMetaModel = sequelizePool.userMetaModel
var helpers = require('../helpers')
    /**
     * Create department-user relation
     * 
     * @param {Integer} departmentId
     * @param {Integer} userId
     * @return {Object}   
     * @api public
     */
exports.create = function*(departmentId, userId, departmentPath) {
        var relation = yield userDepartmentRelationModel.findOne({
            where: {
                department_id: departmentId,
                user_id: userId,
                path: departmentPath
            }
        })
        if (!relation) {
            relation = yield userDepartmentRelationModel.create({
                user_id: userId,
                department_id: departmentId,
                path: departmentPath
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

/**
 * get department-user relation list by departmentId
 * @param {Integer} departmentId
 * @return [Array]   
 * @api public
 */
exports.getChildrenMembers = function*(departmentId,limit,cursor,conditionKey,conditionAdmin,conditionDisable) {
    var order = 'id asc'
    var conditons = {}
    if (conditionKey) {
            conditons.detail = {
                $like:'%' + conditionKey + '%'
            }
    }
    if(conditionAdmin===true){
        var members = yield userMetaModel.findAll({
            where: {
                meta_key:"is_admin",
                meta_value:"1"
            }
        })
        var memberIds = []
        for (var i = 0; i < members.length; i++) {
            var memberId = members[i].user_id
            memberIds.push(memberId)
        }
        conditons.id = {in:memberIds}
    }
    if(conditionDisable===true){
        conditons.status = 0
    }
    var membersPage = yield helpers.simplePage(userModel, conditons, limit, cursor, order)
    return membersPage
}
