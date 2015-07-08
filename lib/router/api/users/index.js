var MiniUser = require("../../../model/mini-user")
/**
 *According access_token, return the user details
 */
exports.getMyAccount = function*() {
	var userId = this.request.user.id 
	this.body = yield MiniUser.getById(userId)
}