/**
 * Module dependencies.
 */
var modelDevice = require("../../../model/device")

/**
 * Get devices for the current user 
 * @api public
 */
exports.getMyDevices = function*() {
    var userId = this.request.user.id
    var devices = yield modelDevice.getDevices(userId)
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
