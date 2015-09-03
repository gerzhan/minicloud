var helpers = require('../helpers')
var MiniUser = require('./user')
var departmentModel = sequelizePool.departmentModel
var userModel = sequelizePool.userModel
var co = require('co')
    /**
     * database table minicloud_files CRUD
     */
var departmentModel = sequelizePool.departmentModel

var changeUserDepartmentPath = function*(department, previousPath) {
    var userList = yield userModel.findAll({
        where: {
            department_path: previousPath
        }
    })
    for (var i = 0; i < userList.length; i++) {
        var user = userList[i]
        user.department_path = department.path
        yield user.save()
    }
}

/**
 * change descendants department path including descendence
 * @param {Object} department
 * @api private
 */
var changedDDPath = function*(department) {
    var oldPath = department.path
    var count = oldPath.split(PATH_SEP).length
    var newName = department.name
    var dds = yield departmentModel.findAll({
        where: {
            path: {
                $like: oldPath + '%'
            }
        }
    })
    for (var i = 0; i < dds.length; i++) {
        var dd = dds[i]
        var pathArr = dd.path.split(PATH_SEP) 
        pathArr[count - 1] = newName
        var newPath = pathArr.join(PATH_SEP)
        dd.path = newPath
        yield dd.save()
    }
}

var hook = function() {
    departmentModel.hook('afterUpdate', function(department, options) {
        return co.wrap(function*() {
            //change department name
            var changedDepartmentName = department.changed('name')
            if (changedDepartmentName) {
                yield changedDDPath(department)
            }
        })()
    })
    departmentModel.hook('afterUpdate', function(department, options) {
        return co.wrap(function*() {
            //change department path
            var changedDepartmentPath = department.changed('path')
            if (changedDepartmentPath) {
                var previousPath = department.previous('path')
                yield changeUserDepartmentPath(department, previousPath)
            }
        })()
    })
}
exports.run = hook
