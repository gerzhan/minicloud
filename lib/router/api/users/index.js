/**
 * Module dependencies.
 */
var modelUser = require("../../../model/user")
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getMyAccount = function*() {
    var userId = this.request.user.id
    this.body = yield modelUser.getById(userId)
}
