var MiniDepartment = require('../../../model/department')
var webHelpers = require('../../../web-helpers')
    /**
     * get department children
     * @api public
     */
exports.children = function*() {
    var body = this.request.body
    body.path = body.path || ''
    //biz
    var path = body.path
    var departmentList = yield MiniDepartment.getChildren(path)
    this.filter = 'id,name'
    this.body = departmentList
}
