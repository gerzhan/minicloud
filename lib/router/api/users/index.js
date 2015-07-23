/**
 * Module dependencies.
 */
var modelUser = require("../../../model/user")
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getCurrentAccount = function*() {
    var userId = this.request.user.id
    var user = yield modelUser.getById(userId)
    this.body = {
    	name:user.name,
    	uuid:user.uuid,
    	created_at:user.created_at,
    	updated_at:user.updated_at
    }
}
