/**
 * valid access token
 * invalid access_token redirect to login page
 * for minicloud 3.0,No relationship with API
 */
 /**
 * Module dependencies.
 */
var webHelpers = require("../web-helpers")
var oauth2Model = require('../router/api/oauth2/model')
    /**
     * valid access token 
     * @param {String} accessToken 
     * @api private
     */
var validAccessToken = function(accessToken) {
        return function(done) {
            if (typeof accessToken == "undefined") {
                return done(null, 10000)
            }
            oauth2Model.getAccessToken(accessToken, function(err, token) {
                if (err) {
                    return done(err, 10002)
                }
                if (!token) {
                    return done(null, 10003)
                }
                if (token.expires !== null &&
                    (!token.expires || token.expires < new Date())) {
                    return done(null, 10004)
                }
                done(null, 1)
            })
        }
    }
    /**
     * Return middleware validate access token 
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    opts = opts || {}
    return function* pageLoader(next) {
        //first query token
        var accessToken = this.request.query.token
        if (typeof(accessToken) == "undefined") {
            accessToken = this.cookies.get('token')
        }
        var errorCode = yield validAccessToken(accessToken)
        if (errorCode == 1) {
            yield * next
        } else {
            //redirect login page
            var returnUrl = webHelpers.getRefererUrl(this.request)
            var url = webHelper.createUrl(this.request, "/login", {
                return_url: returnUrl,
                error_code: errorCode
            })
            this.redirect(url)
        }
    };

}
