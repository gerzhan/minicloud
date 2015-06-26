/**
 *根据用户名+密码获得access_token
 */
var oauthserver = require('koa-oauth-server');
var model = require('./model');
var oauth = oauthserver({
		model: model,
		grants: ['password'],
		debug: false
	});
// function success(){
// 	var request = this.request.body;
// 	var deviceName = request.device_name;
// 	var deviceInfo = request.device_info;
// 	var clientId = request.client_id;
// 	var clientSecret = request.client_secret;
// 	var username = request.username;
// 	var password = request.password;
// 	var grantType = request.grant_type;

// 	console.log(grantType);
// }
exports.token = function*() {
	
	yield oauth.grant()
	
}