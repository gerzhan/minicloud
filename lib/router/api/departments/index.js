var MiniDepartment = require('../../../model/department')
var webHelpers = require('../../../web-helpers')
/**
 * add a department
 * @api public
 */
exports.add = function*() {
    var body = this.request.body
    body.parent_id =  body.parent_id || -1
    //check required fields
    this.checkBody('parent_id').isInt('required number.')
    this.checkBody('name').notEmpty('missing required field.') 
    if (this.errors) { 
        webHelpers.throw400(this)
        return
    }

    var name = body.name
    var parentId = body.parent_id
    //biz
    var existed = yield MiniDepartment.exist(parentId, name)
    if (!existed) {
        yield MiniDepartment.create(parentId, name)
        this.body = ''
    } else {
        webHelpers.throw409(this, 'department_existed', 'department has existed.')
    }
}

/**
 * get department children
 * @api public
 */
exports.children = function*() {
    var body = this.request.body
    body.parent_id =  body.parent_id || -1
    //check required fields
    this.checkBody('parent_id').isInt('required number.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var parentId = body.parent_id
    var departmentList = yield MiniDepartment.getChildren(parentId)
    if (departmentList.length == 0) {
        webHelpers.throw409(this, 'parent_department_not_exist', 'parent department not exist')
    } else {
        this.body = departmentList
    }
}