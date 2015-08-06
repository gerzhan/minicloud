var MiniGroup = require('../../../model/group')
var MiniGroupRelation = require('../../../model/group-relation')
var webHelper = require('../../../web-helpers')
    /**
     *add a group
     * @api public
     */
exports.add = function*() {
    var userId = this.request.user.id
    var body = this.request.body
    var name = body.name
    var existed = yield MiniGroup.exist(userId, name)
    if (!existed) {
        var group = yield MiniGroup.create(userId, name)
        this.body = ''
    } else {
        webHelper.throw409(this, 'group_existed', 'group has existed.')
    }
}

/**
 *get group list
 * @api public
 */
exports.list = function*() {
    var userId = this.request.user.id
    var groupList = yield MiniGroup.getAllByUserId(userId)
    this.filter = 'name'
    this.body = groupList
}
