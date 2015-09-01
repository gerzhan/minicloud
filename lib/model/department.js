'use strict'
/**
 * database table miniyun_departments CRUD
 */
var departmentModel = sequelizePool.departmentModel
var HookDepartment = require('./hook-department')
HookDepartment.run()

/**
 * Create department
 * @param {String} path
 * @return {Object}    
 * @api public
 */
exports.create = function*(path) {
    var pathArr = path.split('/')
    var count   = pathArr.length
    var name    = pathArr[count-1]
    var parentId = -1
    if(count > 2){
        pathArr.pop()
        var parentPath = pathArr.join('/')
        var parentDepartment = yield getByPath(parentPath)
        var parentId = parentDepartment.id
    }
    return yield departmentModel.create({
        user_id: -1,
        name: name,
        description: '',
        path:path,
        parent_id: parentId
    })
}

/**
 * Remove department
 * @param {String} path
 * @api public
 */
exports.remove = function*(path) {
    yield departmentModel.destroy({
        where: {
            path: path
        }
    })
}

/**
 * Rename department
 * @param {String} path
 * @param {String} newName
 * @api public
 */
exports.rename = function*(path, newName) {
    var deparment = yield getByPath(path)
    deparment.name = newName;
    yield deparment.save()
}

/**
 * exist department or not
 * @param {String} path
 * @return {Boolean}  
 * @api public
 */
exports.exist = function*(path) {
    var count = yield departmentModel.count({
        where: {
            path: path
        }
    })
    return count > 0
}

 /**
  * find department by path
  * @param {String} path
  * @return [Array]
  * @api public
  */
exports.getChildren = function*(path) {
    var pathArr = path.split('/')
    var departmentId = -1
    if(path !== ''){
        var parentDepartment = yield getByPath(path)
        departmentId = parentDepartment.id
    }
    return yield departmentModel.findAll({
        where: {
           parent_id: departmentId
        }
    })
}

/**
 * get department by id
 * @param {Integer} id
 * @return {Boolean}  
 * @api public
 */
var getById = function*(id) {
    return yield departmentModel.findById(id)
}

/**
 * get department by path
 * @param {String} path
 * @return {Boolean}  
 * @api public
 */
var getByPath = function*(path) {
    return yield departmentModel.findOne({
        where: {
            path: path
        }
    })
}

/**
 * exist department or not
 * @param {String} path
 * @return {Boolean}  
 * @api public
 */
exports.getDepartment = function*(path) {
    return yield departmentModel.findOne({
        where: {
            path: path
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
exports.getByPath = getByPath