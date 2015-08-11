var MiniDepartment = require('../../../model/department')
var webHelpers = require('../../../web-helpers')
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
        this.filter = 'id,name'
        this.body = departmentList
    }
}