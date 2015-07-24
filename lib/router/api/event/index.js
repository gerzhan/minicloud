/**
 * Module dependencies.
 */
var modelLog = require("../../../model/log")
    /**
     *According access_token, return the log details
     * @api public
     */
exports.getLoginEvents = function*() {
    var userId = this.request.user.id
    var loginEvents = yield modelLog.getById(userId)
    this.body = {
    	message:loginEvents[0].message,
    	context:loginEvents[0].context,
    	created_at:loginEvents[0].created_at,
    	updated_at:loginEvents[0].updated_at
    }
}