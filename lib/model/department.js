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
    var pathArr = path.split(PATH_SEP)

    var department = null
    var parentId = -1
    for (var i = 1; i < pathArr.length; i++) {

        var newPathArr = pathArr.slice(0, i + 1)
        var departmentPath = newPathArr.join(PATH_SEP)
        var name = newPathArr[i]

        department = yield getByPath(departmentPath)
        if (!department) {
            department = yield departmentModel.create({
                name: name,
                description: '',
                path: departmentPath,
                parent_id: parentId
            })
        }
        parentId = department.id
    }
    return department
}

/**
 * Remove department
 * @param {String} path
 * @api public
 */
exports.remove = function*(path) {
    yield departmentModel.destroy({
        where: {
            path: path.toLowerCase()
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
            path: path.toLowerCase()
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
    var pathArr = path.split(PATH_SEP)
    var departmentId = -1
    if (path !== '') {
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
            path: path.toLowerCase()
        }
    })
}
exports.getById = getById
exports.getByPath = getByPath 
