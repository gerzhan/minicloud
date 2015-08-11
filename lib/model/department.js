'use strict'
/**
 * database table miniyun_groups CRUD
 */
var departmentModel = dbPool.groupModel

/**
 * Create department
 * @param {Integer} parentId
 * @param {String} name
 * @return {Object}    
 * @api public
 */
exports.create = function*(parentId, name) {
    var department = yield departmentModel.coCreate({
        user_id: -1,
        name: name,
        description: '',
        parent_group_id: parentId

    })
    return department
}


/**
 * exist department or not
 * @param {Integer} parentId
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(parentId, name) {
    var departmentList = yield departmentModel.coFind({
        parent_group_id: parentId,
        name: name
    })
    return departmentList.length > 0
}

/**
 * find department by parentId
 * @param {Integer} parentId 
 * @return [Array]
 * @api public
 */
exports.getChildren = function*(parentId) {
    var departmentList = yield departmentModel.coFind({
        parent_group_id: parentId
    })
    return departmentList

}

/**
 * judge department exit or not by id
 * @param {Integer} id
 * @return {Boolean}  
 * @api public
 */
exports.getById = function*(id) {
    var departmentList = yield departmentModel.coFind({
        id: id
    })
    // console.log(departmentList[0])
    if(departmentList.length > 0){
        return departmentList[0]
    }
    return null
}
