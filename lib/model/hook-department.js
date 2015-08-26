var helpers = require('../helpers')
var MiniUserDepartmentRelation = require('./user-department-relation')
var departmentModel = sequelizePool.departmentModel
var co = require('co')
    /**
     * database table minicloud_files CRUD
     */
var departmentModel = sequelizePool.departmentModel

var changeUserDepartmentRelationPath = function*(department){
	yield MiniUserDepartmentRelation.renamePath(department.id,department.path)
}

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
            //change version_id
            var changedDepartmentName = department.changed('name')
            if (changedDepartmentName) {
            	yield changedDepartmentPath(department)
            }
        })()
    })
    departmentModel.hook('afterUpdate', function(department, options) {
        return co.wrap(function*() {
            //change version_id
            var changedDepartmentPath = department.changed('path')
            if (changedDepartmentPath) {
                yield changeUserDepartmentRelationPath(department)
            }
        })()
    })
}
exports.run = hook