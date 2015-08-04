var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
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
    var existed = yield MiniUser.exist(name)
    if (!existed) {
        var user = yield MiniUser.create(name, password)
        if (nick) {
            yield MiniUserMeta.create(user.id, 'nick', nick)
        }
        if (nick) {
            yield MiniUserMeta.create(user.id, 'email', email)
        }
        this.body = ''
    } else {
        webHelper.throw409(this, 'member_existed', 'member has existed.') 
    }

}
