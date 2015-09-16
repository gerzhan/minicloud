var MiniUser = require('../../../model/user')
var MiniOnlineDevice = require('../../../model/online-device')
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
    var userIds = yield MiniUser.getIdsByDepartmentPath(departmentPath)
    var devices = yield MiniOnlineDevice.getOnlineDevices([userIds],limit,cursor)
    this.body = devices
}