var modelUser = require("../../../model/user")
var modelUserMeta = require("../../../model/user-meta")

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
    var existed = yield modelUser.exist(name)
    if (!existed) {
        var user = yield modelUser.create(name, password)
        if (nick) {
            yield modelUserMeta.create(user.id, "nick", nick)
        }
        if (nick) {
            yield modelUserMeta.create(user.id, "email", email)
        }
        this.body = ''
    } else {
        //409
        this.throw({
            code: 409,
            error: 'member_existed',
            error_description: 'member has existed'
        }, 409)
    }

}
