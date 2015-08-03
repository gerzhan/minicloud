var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' devices', function() {
    var app = null
    var accessToken = null
    before(function*(done) {
        //start server
        app = yield context.getApp()
        var appModel = require("../../lib/model/app")
        var userModel = require("../../lib/model/user")
        var deviceModel = require("../../lib/model/device")
        yield appModel.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        var user = yield userModel.create("admin", "admin")
        yield deviceModel.create(user, "web client", "JsQCsjF3yr7KACyT")
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
            //set access_token
        accessToken = res.body.access_token
        return done()
    })

    it(protocol + ' should get all devices for the current user', function*(done) {
        var res = yield request(app)
            .post('/api/v1/devices/get_my_devices')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
            //Determine Each element is in line with expectations
        res.body.length.should.equal(2)
        res.body[0].name.should.equal('web client')
        res.body[1].name.should.equal('ji1111m-pc-windows7')
        done()
    })

    it(protocol + ' should return 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/devices/get_my_devices')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })

})
