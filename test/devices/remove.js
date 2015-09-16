var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var should = require('should')

function* getAdminAccessToken(app) {
    var res = yield request(app)
        .post('/api/v1/oauth2/token')
        .type('json')
        .send({
            name: 'admin',
            password: 'admin',
            device_name: 'ji1111m-pc-windows7',
            client_id: 'JsQCsjF3yr7KACyT',
            client_secret: 'bqGeM4Yrjs3tncJZ'
        })
        .expect(200)
        .end()
    return res.body.access_token
}

function* getMyDeviceUuid(app, accessToken) {
    var res = yield request(app)
        .post('/api/v1/devices/list')
        .type('json')
        .set({
            Authorization: 'Bearer ' + accessToken
        })
        .expect(200)
        .end()
    var devices = res.body.devices 
    return devices[0].uuid
}
describe(protocol + ' devices', function() {
    this.timeout(global.timeout)
    var app = null
    var accessToken = null
    var uuid = null
    var MiniOnlineDevice = null
    var device = null
    var MiniEvent = null
    var MiniDevice = null
    var MiniAccessToken = null
    var MiniUser = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniDevice = require('../../lib/model/device')
        MiniOnlineDevice = require('../../lib/model/online-device')
        MiniEvent = require('../../lib/model/event')
        MiniAccessToken = require('../../lib/model/oauth-access-token')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        accessToken = yield getAdminAccessToken(app)
        uuid = yield getMyDeviceUuid(app, accessToken)
            //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        yield MiniOnlineDevice.create(user.id, device.id, device.client_id)
        yield MiniEvent.createLoginEvent('127.0.0.1', device, 'qn9q83fi9ym6ouiunx38he013xszm6k814')
        done()
    })
    describe(protocol + ' devices/remove', function() {
        it(protocol + ' devices/remove 400', function*(done) {
            var res = yield request(app)
                .post('/api/v1/devices/remove')
                .type('json')
                .set({
                    Authorization: 'Bearer ' + accessToken
                })
                .expect(400)
                .end()
            done()
        })
        it(protocol + ' devices/remove 401 other\'s uuid', function*(done) {
            var user1 = yield MiniUser.create('admin1', 'admin1')
                //create user device
            var device1 = yield MiniDevice.create(user1, 'chrome', 'JsQCsjF3yr7KACyT')
            var res = yield request(app)
                .post('/api/v1/devices/remove')
                .type('json')
                .send({
                    uuid: device1.uuid
                })
                .set({
                    Authorization: 'Bearer ' + accessToken
                })
                .expect(401)
                .end()
            done()
        })
        it(protocol + ' devices/remove 409 device_not_exist', function*(done) {
            var res = yield request(app)
                .post('/api/v1/devices/remove')
                .type('json')
                .send({
                    uuid: 'uuid'
                })
                .set({
                    Authorization: 'Bearer ' + accessToken
                })
                .expect(409)
                .end()
            res.body.error.should.equal('device_not_exist')
            done()
        })
        it(protocol + ' devices/remove 200', function*(done) {
            var res = yield request(app)
                .post('/api/v1/devices/remove')
                .type('json')
                .send({
                    uuid: uuid
                })
                .set({
                    Authorization: 'Bearer ' + accessToken
                })
                .expect(200)
                .end()
            var deviceList = yield MiniOnlineDevice.getAllDeviceId(device.id)
            deviceList.length.should.equal(0) 
            var token = yield MiniAccessToken.getToken(accessToken)
            should(token).not.be.ok()
            var deviceObj = yield MiniDevice.getById(device.id)
            should(deviceObj).not.be.ok()
            done()
        })
        it(protocol + ' devices/remove socket.io 200 ', function*(done) {
            global.socket.emit('/api/v1/devices/remove', {
                header: {
                    Authorization: 'Bearer ' + accessToken
                }
            }, function(body) {
                var co = require('co')
                co.wrap(function*() {
                    var deviceList = yield MiniOnlineDevice.getAllDeviceId(device.id)
                    deviceList.length.should.equal(0) 
                    var token = yield MiniAccessToken.getToken(accessToken)
                    should(token).not.be.ok()
                    var deviceObj = yield MiniDevice.getById(device.id)
                    should(deviceObj).not.be.ok()
                    done()
                })()

            })
        })
        it(protocol + ' devices/remove 401', function*(done) {
            var res = yield request(app)
                .post('/api/v1/devices/remove')
                .type('json')
                .send({
                    uuid: uuid
                })
                .set({
                    Authorization: 'Bearer 12234'
                })
                .expect(401)
                .end()
            done()
        })

    })
})
