var MiniGroup = require('../../../model/group')
var MiniUserGroupRelation = require('../../../model/user-group-relation')
var webHelpers = require('../../../web-helpers')
var MiniUser = require('../../../model/user')
    /**
     *add a group
     * @api public
     */
exports.add = function*() {
    //check required fields
    this.checkBody('name').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var name = body.name

    var existed = yield MiniGroup.exist(userId, name)
    if (!existed) {
        var group = yield MiniGroup.create(userId, name)
        this.body = ''
    } else {
        webHelpers.throw409(this, 'group_existed', 'group has existed.')
    }
}

/**
 *get group list
 * @api public
 */
exports.list = function*() {
    var device = this.request.device
    var userId = device.user_id
    var groupList = yield MiniGroup.getAllByUserId(userId)
    this.filter = 'name'
    this.body = groupList
}

/**
 *add a member to the group
 * @api public
 */
exports.addMember = function*() {
        //check required fields
        this.checkBody('name').notEmpty('missing required field.')
        this.checkBody('uuid').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var device = this.request.device
        var userId = device.user_id
        var body = this.request.body
        var name = body.name
        var uuid = body.uuid

        var member = yield MiniUser.getByUuid(uuid)
        if (!member) {
            webHelpers.throw409(this, 'member_not_exist', 'member not exist.')
            return
        }
        var memberId = member.id
        var group = yield MiniGroup.getByName(userId, name)
        if (group) {
            var groupId = group.id
            yield MiniUserGroupRelation.create(groupId, memberId)
            this.body = ''
        } else {
            webHelpers.throw409(this, 'group_not_exist', 'group not exist.')
        }
    }
    /**
     *get members in current group
     * @api public
     */
exports.getMemberList = function*() {
        //check required fields
        this.checkBody('name').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var device = this.request.device
        var userId = device.user_id
        var body = this.request.body
        var name = body.name

        var group = yield MiniGroup.getByName(userId, name)
        if (group) {
            var groupId = group.id
            var relationList = yield MiniUserGroupRelation.getAllByGroupId(groupId)

            var userList = []
            for (var i = 0; i < relationList.length; i++) {
                var user = yield MiniUser.getById(relationList[i].user_id)
                userList.push(user)
            }
            this.filter = 'name,uuid,metas,created_at,updated_at'
            this.body = userList
        } else {
            webHelpers.throw409(this, 'group_not_exist', 'group not exist.')
        }

    }
    /**
     *remove a member in current group
     * @api public
     */
exports.removeMember = function*() {
        //check required fields
        this.checkBody('name').notEmpty('missing required field.')
        this.checkBody('uuid').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var device = this.request.device
        var userId = device.user_id
        var body = this.request.body
        var name = body.name
        var uuid = body.uuid

        var member = yield MiniUser.getByUuid(uuid)
        if (!member) {
            webHelpers.throw409(this, 'member_not_exist', 'member not exist.')
            return
        }
        var memberId = member.id
        var group = yield MiniGroup.getByName(userId, name)
        if (group) {
            var groupId = group.id
            yield MiniUserGroupRelation.remove(groupId, memberId)
            this.body = ''
        } else {
            webHelpers.throw409(this, 'group_not_exist', 'group not exist.')
        }

    }
    /**
     *remove group
     * @api public
     */
exports.remove = function*() {
    //check required fields
    this.checkBody('name').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var name = body.name
    var group = yield MiniGroup.getByName(userId, name)
    if (group) {
        yield group.destroy()
        this.body = ''
    } else {
        webHelpers.throw409(this, 'group_not_exist', 'group not exist.')
    }
}

/**
 *rename group
 * @api public
 */
exports.rename = function*() {
    //check required fields
    this.checkBody('old_name').notEmpty('missing required field.')
    this.checkBody('new_name').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var oldName = body.old_name
    var newName = body.new_name
    if (oldName === newName) {
        this.body = ''
    } else {
        var group = yield MiniGroup.getByName(userId, newName)
        if (group) {
            webHelpers.throw409(this, 'new_group_existed', 'new group has existed.')
            return
        }
        group = yield MiniGroup.getByName(userId, oldName)
        if (!group) {
            webHelpers.throw409(this, 'old_group_not_exist', 'old group not exist.')
            return
        }
        yield MiniGroup.rename(userId, oldName, newName)
        this.body = ''
    }
}
