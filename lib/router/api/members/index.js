/**
 * Module dependencies.
 */
var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
var webHelper = require('../../../web-helpers')
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getMyAccount = function*() {
        var userId = this.request.user.id
        this.filter = 'name,uuid,metas,created_at,updated_at'
        this.body = yield MiniUser.getById(userId)
    }
    /**
     *return the users list
     * @api public
     */
exports.list = function*() {
        var body = this.request.body
        var limit = body.limit
        var cursor = body.cursor 
        this.body = yield MiniUser.list(limit, cursor)
    }
    /**
     *search member
     * @api public
     */
exports.search = function*() {
        var body = this.request.body
        var key = body.key
        var limit = body.limit
        var cursor = body.cursor 
        this.body = yield MiniUser.search(key,limit, cursor)
    }
    /**
     *reset the user assword
     * @api public
     */
exports.resetPassword = function*() {
    var userId = this.request.user.id
    var oldPassword = this.request.body.old_password
    var newPassword = this.request.body.new_password
    var success = yield MiniUser.resetPasswd(userId, oldPassword, newPassword)
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
    param = this.request.body
    var nick = param.nick
    var avatar = param.avatar
    var email = param.email
    if (nick) {
        yield MiniUserMeta.create(userId, 'nick', nick)
    }
    if (avatar) {
        yield MiniUserMeta.create(userId, 'avatar', avatar)
    }
    if (email) {
        yield MiniUserMeta.create(userId, 'email', email)
    }
    this.body = ''
}
