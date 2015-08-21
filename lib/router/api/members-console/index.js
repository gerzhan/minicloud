var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
var webHelpers = require('../../../web-helpers')
var MiniUserDepartmentRelation = require('../../../model/user-department-relation')
    /**
     *return the users list
     * @api public
     */
exports.list = function*() {
        var body = this.request.body
            //set default
        body.departmentId     = body.department_id    
        body.limit            = body.limit || 100
        body.cursor           = body.cursor || ''
        body.conditionKey     = body.condition_key || ''
        body.conditionAdmin   = body.condition_admin || ''
        body.conditionDisabled = body.condition_disabled || ''
            //check required fields
        this.checkBody('departmentId').isInt('required number.')
        this.checkBody('limit').isInt('required number.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var departmentId = body.departmentId
        var limit = body.limit
        var cursor = body.cursor
        var conditionKey = body.conditionKey
        var conditionAdmin = body.conditionAdmin
        var conditionDisabled = body.conditionDisabled
        var memberList = yield MiniUserDepartmentRelation.getChildrenMembers(departmentId,limit,cursor,conditionKey,conditionAdmin,conditionDisabled)
        this.body = memberList
    }