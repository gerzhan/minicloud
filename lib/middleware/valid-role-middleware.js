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
var MiniUser = require('../model/user')
    /**
     * Return middleware validate role
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    return function*(next) {
        var roles = opts.roles
        var user = this.request.user
        var userRole = user.role+''
        var rolesArr = roles.split(',')
        for(var i=0;i<roles.length;i++){
            if(roles[i]===userRole){
                return yield * next
            }
        }
        webHelpers.throw(this, 401, 'require_administrator_token', 'Requires administrator privileges,The access token provided is invalid.')
    }
}
