/**
 * valid administrator access token
 * invalid access_token redirect to login page
 * for minicloud 3.0,No relationship with API
 */
/**
 * Module dependencies.
 */
var webHelpers = require('../web-helpers')
var MiniUserMeta = require('../model/user-meta')
    /**
     * Return middleware validate access token 
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    return function* valid(next) { 
        var userId = this.request.user.id
        var meta = yield MiniUserMeta.getByKey(userId, 'is_admin')  
        if (meta) {
            if (meta.value === '1') { 
                return yield * next
            }
        }
        webHelpers.throw(this, 401, 'require_administrator_token', 'Requires administrator privileges,The access token provided is invalid.')
    }
}
