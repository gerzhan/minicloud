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
            var device = {}
            device.uuid = devices[i].uuid
            device.name = devices[i].name
            device.updated_at = devices[i].updated_at
            deviceList.push(device)
        }
        this.body = deviceList
    }
    /**
     * remove one device and related information
     * @api public
     * 
     */
exports.removeMyDevice = function*() {
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
