var MiniUser = require('../../../model/user')
var MiniUserMeta = require('../../../model/user-meta')
var webHelpers = require('../../../web-helpers')
var MiniOption = require('../../../model/option')
    /**
     *add a member
     * @api public
     */
exports.registe = function*() {
    var body = this.request.body
        //set default
    body.nick = body.nick || body.name
        //check required fields
    this.checkBody('name').notEmpty('missing required field.')
    this.checkBody('password').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var name = body.name
    var password = body.password
    var nick = body.nick
    var email = body.email
    var existed = yield MiniUser.exist(name)
    var option = yield MiniOption.getByKey('user_register_enabled')
    if (option !== null && option.value === '0') {
        webHelpers.throw409(this, 'prohibit_registration', 'prohibit register new users.')
    } else {
        if (!existed) {
            var user = yield MiniUser.create(name, password)
            if (nick) { 
                yield MiniUserMeta.create(user.id, 'nick', nick)
            }
            if (email) {
                yield MiniUserMeta.create(user.id, 'email', email)
            }
            this.body = ''
        } else {
            webHelpers.throw409(this, 'member_existed', 'member has existed.')
        }
    }
}
