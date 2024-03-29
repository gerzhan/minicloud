var MiniDepartment = require('../../../model/department')
var MiniUser = require('../../../model/user')
var webHelpers = require('../../../web-helpers')
var fileHelpers = require('../../../file-helpers')
var S = require('string')
    /**
     * add a department
     * @api public
     */
exports.add = function*() {
    var body = this.request.body
    body.path = body.path || ''
    //check required fields
    this.checkBody('path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }

    var path = body.path
    //biz
    var existed = yield MiniDepartment.exist(path)
    if (!existed) {
        yield MiniDepartment.create(path)
        this.body = ''
    } else {
        webHelpers.throw409(this, 'department_existed', 'department has existed.')
    }
}

/**
 * remove a department
 * @api public
 */
exports.remove = function*() {
    var body = this.request.body
        //check required fields
    this.checkBody('path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var path = body.path
    var department = yield MiniDepartment.getByPath(path)
    if (!department) {
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    } else {
        var childrenList = yield MiniDepartment.getChildren(path)
        if (childrenList.length > 0) {
            webHelpers.throw409(this, 'department_remains_subsectors', 'Department remains subsectors.')
            return
        }
        var relationList = yield MiniUser.getListByDepartmentPath(path)
        if (relationList.length == 0) {
            yield MiniDepartment.remove(path)
            this.body = ''
        } else {
            webHelpers.throw409(this, 'department_remains_users', 'Department remains users.')
            return
        }
    }
}

/**
 * rename a department
 * @api public
 */
exports.rename = function*() {
    var body = this.request.body
        //check required fields
    this.checkBody('path').notEmpty('missing required field.')
    this.checkBody('new_name').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var path = body.path
    var newName = body.new_name
    var department = yield MiniDepartment.getByPath(path)

    if (!department) {//whether has this department
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    } else {
        if (department.name === newName) {
            webHelpers.throw409(this, 'new_name_existed', 'new name existed.')
            return
        }
        yield MiniDepartment.rename(path, newName)
        this.body = ''
    }
}

/**
 * get department users
 * @api public
 */
exports.users = function*() {
    var body = this.request.body
    body.path = body.path
        //check required fields
    this.checkBody('path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var path = body.path
    var department = yield MiniDepartment.getByPath(path)
    if (!department) {
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    } else {
        var users = yield MiniUser.getListByDepartmentPath(path)
        var userList = []
        for (var i = 0; i < users.length; i++) {
            var arr = {}
            var userId = users[i].id
            var user = yield MiniUser.getById(userId)
            userList.push(user)
        }
        //filter
        this.filter = 'detail,name,uuid,metas,created_at,updated_at'
        this.body = userList
    }
}

/**
 * department add user
 * @api public
 */
exports.usersAdd = function*() {
    var body = this.request.body
    body.path = body.path
    body.uuid = body.uuid
        //check required fields
    this.checkBody('path').notEmpty('missing required field.')
    this.checkBody('uuid').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var path = body.path
    var uuid = body.uuid
    var department = yield MiniDepartment.getByPath(path)
    if (!department) {
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
        return
    } else {
        var user = yield MiniUser.getByUuid(uuid)
        if (user == null) {
            webHelpers.throw409(this, 'user_not_exist', 'user not exist')
            return
        } else {
            yield MiniUser.bindUserToDepartment(user.id, path)
            this.body = ''
        }
    }
}

/**
 * department remove user
 * @api public
 */
exports.usersRemove = function*() {
    var body = this.request.body
    body.path = body.path
    body.uuid = body.uuid
        //check required fields
    this.checkBody('path').notEmpty('missing required field.')
    this.checkBody('uuid').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var path = body.path
    var uuid = body.uuid
    var department = yield MiniDepartment.getByPath(path)
    if (!department) {
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
        return
    } else {
        var user = yield MiniUser.getByUuid(uuid)
        if (user == null) {
            webHelpers.throw409(this, 'user_not_exist', 'user not exist')
        } else {
            if(user.department_path !== path){
                webHelpers.throw409(this, 'no_binding', 'No binding')
                return
            }
            yield MiniUser.unbindUserToDepartment(user.id, path)
            this.body = ''
        }
    }
}

/**
 * department import users
 * @api public
 */
exports.import = function*() {
    var body = this.request.body

    this.checkBody('data').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }

    var data = body.data
    var result = {}
    var successCount = 0
    var failedCount = 0
    var userNotExist = []

    for (var i = 0; i < data.length; i++) {
        var departmetnId = null;
        var item = data[i]['department-user']
        var index = item.indexOf(',')
        var departItem = item.substring(0, index)
        var userItem = item.substring(index + 1)
        if (index < 0) {
            departItem = item.substring(0)
        }
        var userArr = userItem.split(',')
        if (index < 0 || userItem == '') {
            userArr = []
        }
        departItem = fileHelpers.normalizePath(departItem)
        var department = yield MiniDepartment.create(departItem)
        for(var n =0;n<userArr.length;n++){
            var userName = S(userArr[n]).trim().s
            var userExist = yield MiniUser.exist(userName)
            if(userExist){
                var user = yield MiniUser.getByName(userName)
                yield MiniUser.bindUserToDepartment(user.id, departItem)
                successCount++
            }else{
                userNotExist.push(userName)
                failedCount++
            }
        }
    }
    result['success_count'] = successCount
    result['failed_count'] = failedCount
    result['user_not_exist'] = userNotExist
    this.body = result;
}