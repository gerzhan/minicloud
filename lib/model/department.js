'use strict'
/**
 * database table miniyun_groups CRUD
 */
var departmentModel = sequelizePool.departmentModel

/**
 * Create department
 * @param {Integer} parentId
 * @param {String} name
 * @return {Object}    
 * @api public
 */
exports.create = function*(parentId, name) {
    return yield departmentModel.create({
        user_id: -1,
        name: name,
        description: '',
        parent_id: parentId

    })
}

/**
 * Remove department
 * @param {Integer} id
 * @api public
 */
exports.remove = function*(id) {
    yield departmentModel.destroy({
        where: {
            id: id
        }
    })
}

/**
 * Rename department
 * @param {Integer} id
 * @param {String} newName
 * @api public
 */
exports.rename = function*(id, newName) {
    var deparment = yield departmentModel.findById(id)
    deparment.name = newName;
    yield deparment.save()
}

/**
 * exist department or not
 * @param {Integer} parentId
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(parentId, name) {
    var count = yield departmentModel.count({
        where: {
            parent_id: parentId,
            name: name
        }
    })
    return count > 0
}

/**
 * find department by parentId
 * @param {Integer} parentId 
 * @return [Array]
 * @api public
 */
exports.getChildren = function*(parentId) {
    return yield departmentModel.findAll({
        where: {
            parent_id: parentId
        }
    })

}

/**
 * judge department exit or not by id
 * @param {Integer} id
 * @return {Boolean}  
 * @api public
 */
exports.getById = function*(id) {
    return yield departmentModel.findById(id)
}

/**
 * exist department or not
 * @param {Integer} parentId
 * @param {String} name
 * @return {Boolean}  
 * @api public
 */
exports.getDepartment = function*(parentId, name) {
    return yield departmentModel.findOne({
        where: {
            parent_group_id: parentId,
            name: name
        }
    })
}
