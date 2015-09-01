var helpers = require('../helpers')
var MiniUser = require('./user')
var departmentModel = sequelizePool.departmentModel
var userModel = sequelizePool.userModel
var co = require('co')
    /**
     * database table minicloud_files CRUD
     */
var departmentModel = sequelizePool.departmentModel

var changeUserDepartmentPath = function*(department,previousPath){
    var userList = yield userModel.findAll({
        where:{
            department_path:previousPath
        }
    })
    for(var i=0;i<userList.length;i++){
        userList[i].department_path = department.path
        yield userList[i].save()
    }
}

/**
* change department path including descendence
 * @param {Object} department
 * @api private
*/
var changedDepartmentPath = function*(department){
	var path = department.path
	var newName = department.name
    var list = yield departmentModel.findAll({
        where: {
            path:{
                $like: path+'%'
            }
        }
    })
    for(var i=0;i<list.length;i++){
        var pathArr = list[i].path.split('/')
        if(i==0){
            var count = pathArr.length-1
        }
        pathArr[count] = newName
        var newPath = pathArr.join('/')
        list[i].path = newPath
        yield list[i].save()
    }
}

var hook = function(){
	departmentModel.hook('afterUpdate', function(department, options) {
        return co.wrap(function*() {
            //change department name
            var changedDepartmentName = department.changed('name')
            if (changedDepartmentName) {
            	yield changedDepartmentPath(department)
            }
        })()
    })
    departmentModel.hook('afterUpdate', function(department, options) {
        return co.wrap(function*() {
            //change department path
            var changedDepartmentPath = department.changed('path')
            if (changedDepartmentPath) {
                var previousPath = department.previous('path')
                yield changeUserDepartmentPath(department,previousPath)
            }
        })()
    })
}
exports.run = hook