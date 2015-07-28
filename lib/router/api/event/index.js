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
    var eventsDbResult = yield modelEvent.getLoginEventsByUserId(userId)
    var eventsList = []
    for (var i = 0; i < eventsDbResult.length; i++) {
        var eventing = {}
        eventing.context = eventsDbResult[i].context
        eventing.updated_at = eventsDbResult[i].updated_at
        eventsList.push(eventing)
    }
    this.body = eventsList
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

