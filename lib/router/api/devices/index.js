/**
 * Module dependencies.
 */
var MiniDevice = require('../../../model/device')
var webHelpers = require('../../../web-helpers')
    /**
     * Get devices for the current user 
     * @api public
     */
exports.list = function*() {
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
        var userId = this.request.device.user_id
        this.body = yield MiniDevice.list(userId, limit, cursor)
    }
    /**
     * remove one device and related information
     * @api public
     * 
     */
exports.remove = function*() {
    //check required fields
    this.checkBody('uuid').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var uuid = body.uuid
    var device = yield MiniDevice.getByUuid(uuid)
    if (device) {
        if (device.user_id != userId) {
            webHelpers.throwSimple401(this)
        } else {
            yield device.destroy()
            this.body = ''
        }
    } else {
        webHelpers.throw409(this, 'device_not_exist', 'device not exist.')
    }
}
