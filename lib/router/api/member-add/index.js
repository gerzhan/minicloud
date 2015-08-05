var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
var webHelper = require('../../../web-helpers')
var MiniOption = require('../../../model/option')
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
    var option = yield MiniOption.getByKey('user_register_enabled')
    if (option !== null && option.value === '0') {
        webHelper.throw409(this, 'prohibit_registered', 'Prohibit registered users.')
    } else {
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
}
