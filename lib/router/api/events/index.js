/**
 * Module dependencies.
 */
var MiniEvent = require('../../../model/event')
var helpers = require('../../../helpers')
var webHelpers = require('../../../web-helpers')
var EVENT_LOGIN = 1
var EVENT_LOGOUT = 2
    /**
     *According access_token, return the all events
     * @api public
     */
exports.getEvents = function*() {
        var body = this.request.body
            //set default
        body.limit = body.limit || 100
        body.cursor = body.cursor || ''
        body.type = body.type || 'all'
        body.before_created_at = body.before_created_at || new Date();
        //check required fields
        this.checkBody('limit').isInt('required number.')
        this.checkBody('type').empty().in(["login", "all"])
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var device = this.request.device
        var limit = body.limit
        var cursor = body.cursor
        var type = body.type
        var before_created_at = body.before_created_at
        var conditions = {
            user_id: device.user_id
        }
        if (type === 'login') {
            conditions.type = {
                $in: [EVENT_LOGIN, EVENT_LOGOUT]
            }
        }
        conditions.created_at = {
            $lte: before_created_at
        }
        var events = yield MiniEvent.getList(conditions, limit, cursor)
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
