var miniUser = require("../../../model/user")
var miniUserMeta = require("../../../model/user-meta")
var webHelper = require('../../../web-helpers')

/**
 *add a member
 * @api public
 */
exports.add = function*() {
    var body = this.request.body
    var name = body.name
    var password = body.password
    var nick = body.nick
    var email = body.email
    var existed = yield miniUser.exist(name)
    if (!existed) {
        var user = yield miniUser.create(name, password)
        if (nick) {
            yield miniUserMeta.create(user.id, "nick", nick)
        }
        if (nick) {
            yield miniUserMeta.create(user.id, "email", email)
        }
        this.body = ''
    } else {
        webHelper.throw409(this, 'member_existed', 'member has existed.') 
    }

}
