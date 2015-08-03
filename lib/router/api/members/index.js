/**
 * Module dependencies.
 */
var modelUser = require("../../../model/user")
var modelUserMeta = require("../../../model/user-meta")
var webHelper = require('../../../web-helpers')
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getMyAccount = function*() {
        var userId = this.request.user.id
        var user = yield modelUser.getById(userId)
        var dbMetas = yield modelUserMeta.getAll(userId)
        var metas = {}
        for (var i = 0; i < dbMetas.length; i++) {
            var item = dbMetas[i]
            metas[item.key] = item.value
        }
        if (!metas.avatar) {
            metas.avatar = "/assets/default-avatar.png"
        }
        this.body = {
            name: user.name,
            uuid: user.uuid,
            metas: metas,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    }
    /**
     *return the users list
     * @api public
     */
exports.list = function*() {
    var memberModelList = yield modelUser.list()
    var memberList = []
    for (var i = 0; i < memberModelList.length; i++) {
        var member = {}
        var memberId = memberModelList[i].id
        var memberMeta = yield modelUserMeta.getAll(memberId)
        member['name'] = memberModelList[i].name
        for (var j = 0; j < memberMeta.length; j++) {
            if (memberMeta[j].key == "nick") {
                member["nick"] = memberMeta[j].value
            }
            if (memberMeta[j].key == "phone") {
                member["phone"] = memberMeta[j].value
            }
            if (memberMeta[j].key == "email") {
                member["email"] = memberMeta[j].value
            }
            if (memberMeta[j].key == "space") {
                member["space"] = memberMeta[j].value
            }
            if (memberMeta[j].key == "is_admin") {
                member["is_admin"] = (memberMeta[j].value === "1" ? true : false)
            }
            if (memberMeta[j].key == "file_sort_type") {
                member["file_sort_type"] = memberMeta[j].value
            }
            if (memberMeta[j].key == "file_sort_order") {
                member["file_sort_order"] = memberMeta[j].value
            }
        }
        console.log(memberId)
        console.log(this.request.user.id)
        // if(this.request.user.id!=memberId){//用于排除自己
            memberList.push(member)
        // }
    }
    this.body = memberList
}
    /**
     *search member
     * @api public
     */
exports.search = function*() {
    var body = this.request.body
    var key = body.key
    var certainMemberModelList = yield modelUser.search(key)
    memberList = []
    for(var i=0;i<certainMemberModelList.length;i++){
        member = certainMemberModelList[i]
        var item = {}
        item.name = member.name
        if(this.request.user.id!=member.id){//用于排除自己
            memberList.push(item)
        }
    }
    this.body = memberList
}
    /**
     *reset the user assword
     * @api public
     */
exports.resetPassword = function*() {
    var userId = this.request.user.id
    var oldPassword = this.request.body.old_password
    var newPassword = this.request.body.new_password
    var success = yield modelUser.resetPasswd(userId, oldPassword, newPassword)
    if (success) {
        this.body = ''
    } else {
        webHelper.throw409(this, 'old_password_invalid', 'old password is invalid.')
    }
}

/**
 *set the user profile
 * @api public
 */
exports.setProfile = function*() {
    var userId = this.request.user.id
    var metas = this.request.body
    var nick = metas.nick
    var avatar = metas.avatar
    var email = metas.email
    if (nick) {
        yield modelUserMeta.create(userId, 'nick', nick)
    }
    if (avatar) {
        yield modelUserMeta.create(userId, 'avatar', avatar)
    }
    if (email) {
        yield modelUserMeta.create(userId, 'email', email)
    }
    this.body = ''
}
