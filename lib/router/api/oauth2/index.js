/**
 * Module dependencies.
 */
var oauthserver = require('../../../../third-npm/koa-oauth-server') 
var model = require('./model')
var webHelpers = require('../../../web-helpers')
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
    //set default values
    var body = this.request.body
    body.client_id = body.client_id || 'JsQCsjF3yr7KACyT'
    body.client_secret = body.client_secret || 'bqGeM4Yrjs3tncJZ'
    body.device_name = body.device_name || 'chrome'
        //check required fields
    this.checkBody('name').notEmpty('missing required field.')
    this.checkBody('password').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //business
    yield oauth.grant()
}
