/**
 * Module dependencies.
 */
var modelDevice = require("../../../model/device")
var modelOnlineDevice = require("../../../model/online-device")
var modelEvent = require("../../../model/event") 
var webHelper = require('../../../web-helpers') 
    /**
     * Get devices for the current user 
     * @api public
     */
exports.getMyDevices = function*() {
        var userId = this.request.user.id
        var devices = yield modelDevice.getAllByUserId(userId)
        this.filter = 'uuid,name,updated_at' 
        this.body = devices
    }
    /**
     * remove one device and related information
     * @api public
     * 
     */
exports.remove = function*() {
    var userId = this.request.user.id
    var body = this.request.body
    var uuid = body.uuid 
    var device = yield modelDevice.getByUuid(uuid) 
    if (device) {
        if (device.user_id != userId) {
            webHelper.throw401(this)   
        } else {
            var deviceId = device.id
            yield modelDevice.removeAllByUuid(uuid)
            yield modelOnlineDevice.removeAllByDeviceId(deviceId)
            yield modelEvent.removeAllByDeviceId(deviceId)
            this.body = ''
        }
    } else {
        webHelper.throw409(this,'not_existed','device not existed.')         
    }
}
