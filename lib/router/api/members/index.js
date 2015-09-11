/**
 * Module dependencies.
 */
var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
var webHelpers = require('../../../web-helpers')
var S = require('string')
var normalizeName = function(name, replaceKey) {
        var NAME_KEY = '-'
        if(typeof(replaceKey)!=='undefined'){
            NAME_KEY = replaceKey
        }
        var sKeys = [':', '\\', ':', '*', '?', '"', '<', '>', '|', ',', '/']
        for (var i = 0; i < sKeys.length; i++) {
            name = S(name).replaceAll(sKeys[i], NAME_KEY).s
        }
        return name
    }
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getMyAccount = function*() {
        var device = this.request.device
        this.filter = 'name,uuid,metas,created_at,updated_at'
        this.body = yield MiniUser.getById(device.user_id)
    }
    /**
     *return the users list
     * @api public
     */
exports.list = function*() {
        var body = this.request.body
            //set default
        body.limit = body.limit || 100
        body.cursor = body.cursor || ''
            //check required fields
        this.checkBody('limit').isInt('required number.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
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
            //set default
        body.limit = body.limit || 100
        body.cursor = body.cursor || ''
            //check required fields
        this.checkBody('key').notEmpty('required field.')
        this.checkBody('limit').isInt('required number.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var key = normalizeName(body.key, '') 
        var limit = body.limit
        var cursor = body.cursor
        this.body = yield MiniUser.search(key, limit, cursor)
    }
    /**
     *reset the user assword
     * @api public
     */
exports.resetPassword = function*() {
    //check required fields
    this.checkBody('old_password').notEmpty('required field.')
    this.checkBody('new_password').notEmpty('required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var device = this.request.device
    var userId = device.user_id
        //To determine whether the user is locked out
    var isLocked = yield MiniUserMeta.isLocked(userId)
    if (isLocked) {
        webHelpers.throw409(this, 'member_locked', 'user is locked,enter the wrong password over five times.please try again after 15 minutes.')
        return
    }
    var oldPassword = this.request.body.old_password
    var newPassword = this.request.body.new_password
    var success = yield MiniUser.resetPasswd(userId, oldPassword, newPassword)
    if (success) {
        this.body = ''
    } else {
        webHelpers.throw409(this, 'old_password_invalid', 'old password is invalid.')
    }
}

/**
 *set the user profile
 * @api public
 */
exports.setProfile = function*() {
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var nick = body.nick
    var avatar = body.avatar
    var email = body.email
    if (nick) {
        nick = normalizeName(nick)
        yield MiniUserMeta.create(userId, 'nick', nick)
    }
    if (avatar) {
        yield MiniUserMeta.create(userId, 'avatar', avatar)
    }
    if (email) {
        this.checkBody('email').isEmail("your enter a bad email.")
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        yield MiniUserMeta.create(userId, 'email', email)
    }
    this.body = ''
}
