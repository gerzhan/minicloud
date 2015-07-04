var MiniUser = require("../../../model/mini-user")
/**
 *根据access_token获得用户信息
 */
exports.getMyAccount = function*() {
	var userId = this.request.user.id 
	this.body = yield MiniUser.getById(userId)
}