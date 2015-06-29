/**
 *当前用户信息
 */
var MiniUser = require("../../model/mini-user")
exports.currentUserInfo = function*() {
	var userId = this.request.user.id 
	this.body = yield MiniUser.getById(userId)
}