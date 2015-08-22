/**
 * Module dependencies.
 */
var MiniEvent = require('../../../model/event')
var helpers = require('../../../helpers')
var webHelpers = require('../../../web-helpers')
    /**
     *According access_token, return the login log details
     * @api public
     */
exports.getLoginEvents = function*() {

        var body = this.request.body
            //set default
        body.limit = body.limit || 100
        body.cursor = body.cursor || ''
            //check required fields
        this.checkBody('limit').isInt('required number.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var limit = body.limit
        var cursor = body.cursor
        var device = this.request.device
        var userId = device.user_id
        var events = yield MiniEvent.getLoginEventsByUserId(userId, limit, cursor)
        this.body = events
    }
    /**
     * delete login events
     * @api public
     */
exports.cleanLoginEvents = function*() {
    var device = this.request.device
    var userId = device.user_id
    yield MiniEvent.cleanLoginEvents(userId)
    this.body = ''
}
