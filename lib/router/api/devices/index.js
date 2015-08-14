/**
 * Module dependencies.
 */
var MiniDevice = require('../../../model/device')
var webHelpers = require('../../../web-helpers')
    /**
     * Get devices for the current user 
     * @api public
     */
exports.getMyDevices = function*() {
        var userId = this.request.user.id
        var devices = yield MiniDevice.getAllByUserId(userId)
        this.filter = 'uuid,name,updated_at'
        this.body = devices
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
    var userId = this.request.user.id
    var body = this.request.body
    var uuid = body.uuid
    var device = yield MiniDevice.getByUuid(uuid)
    if (device) {
        if (device.user_id != userId) {
            webHelpers.throwSimple401(this)
        } else { 
            yield device.coRemove()
            this.body = ''
        }
    } else {
        webHelpers.throw409(this, 'device_not_exist', 'device not exist.')
    }
}
