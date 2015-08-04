/**
 * Module dependencies.
 */
var miniEvent = require("../../../model/event")
var helpers = require('../../../helpers')
    /**
     *According access_token, return the login log details
     * @api public
     */
exports.getLoginEvents = function*() {
        var userId = this.request.user.id
        var body = this.request.body
        var limit = body.limit
        var cursor = body.cursor
        var events = yield miniEvent.getLoginEventsByUserId(userId, limit, cursor)
        this.body = events
    }
    /**
     * delete login events
     * @api public
     */
exports.cleanLoginEvents = function*() {
    var userId = this.request.user.id
    yield miniEvent.cleanLoginEvents(userId)
    this.body = ''
}
