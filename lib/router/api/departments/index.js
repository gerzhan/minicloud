var MiniDepartment = require('../../../model/department')
var MiniUser = require('../../../model/user')
var webHelpers = require('../../../web-helpers')
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

    if (!department) { //whether has this department
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
 * get department members
 * @api public
 */
exports.members = function*() {
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
        var userList = yield MiniUser.getListByDepartmentPath(path)
        var memberList = []
        for (var i = 0; i < userList.length; i++) {
            var arr = {}
            memberId = userList[i].id
            var user = yield MiniUser.getById(memberId)
            memberList.push(user)
        }
        //filter
        this.filter = 'name,uuid,metas,created_at,updated_at'
        this.body = memberList
    }
}

/**
 * department add member
 * @api public
 */
exports.membersAdd = function*() {
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
        var member = yield MiniUser.getByUuid(uuid)
        if (member == null) {
            webHelpers.throw409(this, 'member_not_exist', 'member not exist')
            return
        } else {
            yield MiniUser.bindUserToDepartment(member.id, path)
            this.body = ''
        }
    }
}

/**
 * department remove member
 * @api public
 */
exports.membersRemove = function*() {
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
        var member = yield MiniUser.getByUuid(uuid)
        if (member == null) {
            webHelpers.throw409(this, 'member_not_exist', 'member not exist')
        } else {
            yield MiniUser.unbindUserToDepartment(member.id, path)
            this.body = ''
        }
    }
}

/**
 * department import members
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
    var memberNotExist = []

    for (var i = 0; i < data.length; i++) {
        var departmetnId = null;
        var item = data[i]['department-member']
        var index = item.indexOf(',')
        var departItem = item.substring(0, index)
        var memberItem = item.substring(index + 1)
        if (index < 0) {
            departItem = item.substring(0)
        }
        var memberArr = memberItem.split(',')
        if (index < 0 || memberItem == '') {
            memberArr = []
        }
        var department = yield MiniDepartment.create(departItem)
        for (var n = 0; n < memberArr.length; n++) {
            var userName = S(memberArr[n]).trim().s
            var userExist = yield MiniUser.exist(userName)
            if (userExist) {
                var user = yield MiniUser.getByName(userName)
                yield MiniUser.bindUserToDepartment(user.id, departItem)
                successCount++
            } else {
                memberNotExist.push(userName)
                failedCount++
            }
        }
    }
    result['success_count'] = successCount
    result['failed_count'] = failedCount
    result['member_not_exist'] = memberNotExist
    this.body = result;
}
