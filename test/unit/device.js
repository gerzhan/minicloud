var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' device.js', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniDevice = null
    var MiniUser = null
    before(function*(done) {
        app = yield context.getApp()
        MiniUser = require('../../lib/model/user')
        MiniDevice = require('../../lib/model/device')
        return done()
    })
    it(protocol + ' create', function*(done) {
        var user = yield MiniUser.create('admin', 'admin')
        var device1 = yield MiniDevice.create(user, 'chrome', 'JsQCsjF3yr7KACyT')
        var device2 = yield MiniDevice.create(user, 'chrome', 'JsQCsjF3yr7KACyT')
        assert.equal(device1.id, device2.id)
        var device1 = yield MiniDevice.create(user, 'chrome1', 'JsQCsjF3yr7KACyT')
        var device2 = yield MiniDevice.create(user, 'chrome1', 'JsQCsjF3yr7KACyT')
        assert.equal(device1.id, device2.id)
        done()
    })
    it(protocol + ' getAllByUserId', function*(done) {
        var deviceList = yield MiniDevice.getAllByUserId(1234)
        assert.equal(deviceList.length, 0)
        done()
    })
})
