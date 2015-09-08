var MiniUser = require('../../../model/user')
var MiniFile = require('../../../model/file')
var webHelpers = require('../../../web-helpers')
var helpers = require('../../../helpers')
    /**
     *return the users list
     * @api public
     */
exports.list = function*() {
    var body = this.request.body
    var user = this.request.user
        //set default
    body.limit = body.limit || 100
    body.cursor = body.cursor || ''
    body.department_path = body.department_path || PATH_SEP
    //biz
    var departmentPath = body.department_path
    var limit = body.limit
    var cursor = body.cursor
    departmentPath = yield helpers.getValidDepartmentPath(departmentPath, user)
    var memberList = yield MiniUser.getDescendants(departmentPath, '', '')
    var userIds = []
    for (var i = 0; i < memberList.items.length; i++) {
        var user = memberList.items[i]
        userIds.push(user.id)
    }
    var conditions = {}
    conditions.user_id = {
        $in: userIds
    }
    var files = yield MiniFile.listFolder(conditions, cursor, limit)
    this.body = files
}