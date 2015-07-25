var assert = require("assert")
var request = require("supertest")
var co = require('co')
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' devices', function() {
    var app = null
    var accessToken = null
    before(function(done) {
        co.wrap(function*() {
            //start server
            app = yield context.getApp()
            var modelApp = require("../../lib/model/app")
            var modelUser = require("../../lib/model/user")
            var modelDevice = require("../../lib/model/device")
            yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
            var user = yield modelUser.create("admin", "admin")
            yield modelDevice.create(user, "web client", "JsQCsjF3yr7KACyT")
            request(app)
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
                .end(function(err, res) {
                    if (err) return done(err)
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8')
                    res.body.token_type.should.equal('bearer')
                        //set access_token
                    accessToken = res.body.access_token
                    return done()
                })
        })()
    })

    it(protocol + ' should get all devices for the current user', function(done) {
        request(app)
            .post('/api/v1/devices/get_my_devices')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                res.body.length.should.equal(2)
                res.body[0].name.should.equal('web client')
                res.body[1].name.should.equal('ji1111m-pc-windows7')
                done()
            })
    })

    it(protocol + ' should return 401', function(done) {
        request(app)
            .post('/api/v1/devices/get_my_devices')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end(function(err, res) {
                if (err) return done(err)
                done()
            })
    })

})
