var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
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
    body.departmentPath = body.department_path
    body.limit = body.limit || 100
    body.cursor = body.cursor || ''
    body.conditionKey = body.condition_key || ''
    body.conditionAdmin = body.condition_admin || ''
    body.conditionDisabled = body.condition_disabled || ''
        //check required fields
    this.checkBody('departmentPath').notEmpty('required field.')
    this.checkBody('limit').isInt('required number.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var departmentPath = body.departmentPath
    var limit = body.limit
    var cursor = body.cursor
    var conditionKey = body.conditionKey
    var conditionAdmin = body.conditionAdmin
    var conditionDisabled = body.conditionDisabled
    departmentPath = yield helpers.getValidDepartmentPath(departmentPath, user)
    var userList = yield MiniUser.getDescendants(departmentPath, limit, cursor, conditionKey, conditionAdmin, conditionDisabled)
    this.body = userList
}
exports.setStatus = function*() {
    var body = this.request.body
        //check required fields
    this.checkBody('uuid').notEmpty('required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
}
exports.setRole = function*() {
    var body = this.request.body
        //check required fields
    this.checkBody('uuid').notEmpty('required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var role = body.role

    yield MiniUser.setRole(body.uuid)
    this.body = ''
}
exports.remove = function*() {
    var body = this.request.body
        //check required fields
    this.checkBody('uuid').notEmpty('required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var uuid = body.uuid
    var user = yield MiniUser.getByUuid(uuid)
    if (user) {
        yield user.destroy()
        this.body = ''
    } else {
        webHelpers.throw409(this, 'user_not_exist', 'user not exist.')
        return
    }
}
