var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL

function* getAdminAccessToken(app) {
    var res = yield request(app)
        .post('/api/v1/oauth2/token')
        .type('json')
        .send({
            name: 'admin',
            password: 'admin',
            device_name: 'ji1111m-pc-windows7',
            app_key: 'JsQCsjF3yr7KACyT',
            app_secret: 'bqGeM4Yrjs3tncJZ'
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
    var app = null
    var accessToken = null
    var uuid = null

    before(function*(done) {
        app = yield context.getApp()

        var modelApp = require("../../lib/model/app")
        var modelUser = require("../../lib/model/user")
        var modelDevice = require("../../lib/model/device")

        var modelOnlineDevice = require("../../lib/model/online-device")
        var modelEvent = require("../../lib/model/event")

        yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        var user = yield modelUser.create("admin", "admin")
        accessToken = yield getAdminAccessToken(app)
        uuid = yield getMyDeviceUuid(app, accessToken)

        var devices = yield modelDevice.getAllByUserId(user.id)
        device = devices[0]
        yield modelOnlineDevice.create(user.id, device.id, device.client_id)
        yield modelEvent.createLoginEvent(user.id, device.id, 'qn9q83fi9ym6ouiunx38he013xszm6k814')
        done()
    })
    describe(protocol + ' devices/remove', function() {
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
            done()
        })
    })
})
