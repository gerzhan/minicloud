/**
 * Module dependencies.
 */
var modelEvent = require("../../../model/event")
    /**
     *According access_token, return the log details
     * @api public
     */
exports.getLoginEvents = function*() {
    var userId = this.request.user.id
    var eventsDbResult = yield modelEvent.getById(userId)
    var eventsList = []
    for (var i = 0; i < eventsDbResult.length; i++) {
        var eventing = {}
        // eventing.message = eventsDbResult[i].message
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
    var type = 1
    var eventsDbResult = yield modelEvent.cleanLoginEvents(userId,type)
    this.body = ''
}

