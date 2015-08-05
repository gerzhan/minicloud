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
        .post('/api/v1/devices/get_my_devices')
        .type('json')
        .set({
            Authorization: 'Bearer ' + accessToken
        })
        .expect(200)
        .end()
    return res.body[0].uuid
}
describe(protocol + ' devices', function() {
     this.timeout(10000)
    var app = null
    var accessToken = null
    var uuid = null
    var MiniOnlineDevice = null
    var device = null
    var MiniEvent = null
    var MiniDevice = null
    var MiniAccessToken = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        MiniDevice = require('../../lib/model/device')
        MiniOnlineDevice = require('../../lib/model/online-device')
        MiniEvent = require('../../lib/model/event')
        MiniAccessToken = require('../../lib/model/oauth-access-token')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        accessToken = yield getAdminAccessToken(app)
        uuid = yield getMyDeviceUuid(app, accessToken)
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        yield MiniOnlineDevice.create(user.id, device.id, device.client_id)
        yield MiniEvent.createLoginEvent(user.id, device.id, 'qn9q83fi9ym6ouiunx38he013xszm6k814')
        done()
    })
    describe(protocol + ' devices/remove', function() {
        it(protocol + ' should return 409', function*(done) {
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
            res.body.error_description.should.equal('device not existed.')
            done()
        })
        it(protocol + ' should remove one device', function*(done) {
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
            var eventList = yield MiniEvent.getAllEventsByDeviceId(device.id)
            eventList.length.should.equal(0)
            var deviceObj = yield MiniDevice.getById(device.id)
            should(deviceObj).not.be.ok()
            done()

        })
        it(protocol + ' should return 401', function*(done) {
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
