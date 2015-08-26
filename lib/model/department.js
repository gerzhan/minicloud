'use strict'
/**
 * database table miniyun_groups CRUD
 */
var departmentModel = sequelizePool.departmentModel
var HookDepartment = require('./hook-department')
HookDepartment.run()

/**
 * Create department
 * @param {Integer} parentId
 * @param {String} name
 * @return {Object}    
 * @api public
 */
exports.create = function*(parentId, name) {
    var pathArr = yield getParentNode(parentId,[])
    var parentPath = ''
    if(pathArr.length>0){
        var parentPath = '/'+pathArr.reverse().join('/')
    }
    var currentPath = parentPath+'/'+name
    return yield departmentModel.create({
        user_id: -1,
        name: name,
        description: '',
        parent_id: parentId,
        path:currentPath
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
var getById = function*(id) {
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
/**
 * recursive get parentPath array
 * @param {Integer} parentId
 * @param {Integer} pathArr
 * @return [Array]
 */
var getParentNode = function*(parentId,pathArr){
    if(parentId==-1){
        return pathArr
    }else{
        var parentDepartment = yield getById(parentId)
        var parentId = parentDepartment.parent_id
        var name = parentDepartment.name
        pathArr.push(name)
        return yield getParentNode(parentId,pathArr)
    }
}
exports.getById = getById