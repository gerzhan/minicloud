/**
 * Module dependencies.
 */
var oauthserver = require('koa-oauth-server')
var model = require('./model')
var oauth = oauthserver({
        model: model,
        grants: ['password'],
        debug: false
    })
    /**
     * valid password 
     * @api public
     */
exports.token = function*() {

    yield oauth.grant()

}
