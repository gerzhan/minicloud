var oauthserver = require('koa-oauth-server');
var model = require('./model');
var oauth = oauthserver({
	model: model,
	grants: ['password'],
	debug: false
});
/**
 *根据用户名+密码获得access_token
 */
exports.token = function*() {

	yield oauth.grant()

}