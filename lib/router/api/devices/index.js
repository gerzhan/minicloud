/**
 * Module dependencies.
 */
var modelDevice = require("../../../model/device")

var modelOnlineDevice = require("../../../model/online-device")
var modelEvent = require("../../../model/event")
    /**
     * Get devices for the current user 
     * @api public
     */
exports.getMyDevices = function*() {
        var userId = this.request.user.id
        var devices = yield modelDevice.getAllByUserId(userId)
        var deviceList = []

        for (var i = 0; i < devices.length; i++) {
            var device = devices[i]
            var item = {}
            item.id = device.id
            item.uuid = device.uuid
            item.name = device.name
            item.updated_at = device.updated_at
            deviceList.push(item)
        }
        this.body = deviceList
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
            //401
            this.throw({
                code: 401,
                error: 'invalid_token',
                error_description: 'The access token provided is invalid.'
            }, 401)
        } else {
            var deviceId = device.id
            yield modelDevice.removeAllByUuid(uuid)
            yield modelOnlineDevice.removeAllByDeviceId(deviceId)
            yield modelEvent.removeAllByDeviceId(deviceId)
            this.body = ''
        }
    } else {
        //409
        this.throw({
            code: 409,
            error: 'not_existed',
            error_description: 'device not existed.'
        }, 409)
    }
}
