/**
 * Module dependencies.
 */
var modelEvent = require("../../../model/event")
    /**
     *According access_token, return the login log details
     * @api public
     */
exports.getLoginEvents = function*() {
    var userId = this.request.user.id
    var events = yield modelEvent.getLoginEventsByUserId(userId)
    this.filter = 'context,updated_at' 
    this.body = events
}
    /**
     * delete login events
     * @api public
     */
exports.cleanLoginEvents = function*() {
    var userId = this.request.user.id
    yield modelEvent.cleanLoginEvents(userId)
    this.body = ''
}

