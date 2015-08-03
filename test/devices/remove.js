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
    var onlineDeviceModel = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()

        var appModel = require("../../lib/model/app")
        var userModel = require("../../lib/model/user")
        var deviceModel = require("../../lib/model/device")

        onlineDeviceModel = require("../../lib/model/online-device")
        var eventModel = require("../../lib/model/event")

        yield appModel.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        var user = yield userModel.create("admin", "admin")
        accessToken = yield getAdminAccessToken(app)
        uuid = yield getMyDeviceUuid(app, accessToken)

        var devices = yield deviceModel.getAllByUserId(user.id)
        device = devices[0]
        yield onlineDeviceModel.create(user.id, device.id, device.client_id)
        yield eventModel.createLoginEvent(user.id, device.id, 'qn9q83fi9ym6ouiunx38he013xszm6k814')
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
            var deviceList = yield onlineDeviceModel.getAllDeviceId(device.id)
            deviceList.length.should.equal(0)
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
                var deviceList = yield onlineDeviceModel.getAllDeviceId(device.id)
            deviceList.length.should.equal(0)
            done()
        })
    })
})
