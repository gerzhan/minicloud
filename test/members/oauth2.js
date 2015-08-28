var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' oauth2', function() {
    this.timeout(10000)
    var app = null
    var user = null
    var MiniDevice = null
    var MiniOnlineDevice = null
        //before hook start app server,initialize data
    before(function*(done) {
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        MiniDevice = require('../../lib/model/device')
        MiniOnlineDevice = require('../../lib/model/online-device')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        return done()
    })

    describe(protocol + ' oauth2/token', function() {
        it(protocol + ' oauth2/token 401 invalid_client', function*(done) {
            var res = yield request(app)
                .post('/api/v1/oauth2/token')
                .type('json')
                .send({
                    name: 'admin',
                    password: 'admin',
                    device_name: 'ji1111m-pc-windows7',
                    client_id: 'JsQCsjF3yr7KACyT1',
                    client_secret: 'bqGeM4Yrjs3tncJZ'
                })
                .expect(401)
                .end()
            res.body.error.should.equal('invalid_client')
            done()
        })
        it(protocol + ' oauth2/token 200', function*(done) {
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
            res.should.have.header('Content-Type', 'application/json; charset=utf-8')
            res.body.token_type.should.equal('bearer')
            var devices = yield MiniDevice.getAllByUserId(user.id)
            var device = devices[0]
            device.client_id.should.equal('JsQCsjF3yr7KACyT')
            var onlineDevices = yield MiniOnlineDevice.getAllDeviceId(device.id)
            onlineDevices.length.should.equal(1)
            done()
        })
        it(protocol + ' oauth2/token socket.io 200', function*(done) {
            var client = require('../socket-io-client')
            var socket = client(app)
            socket.on('connect', function() {
                socket.emit('/api/v1/oauth2/token', {
                    header: {},
                    data: {
                        name: 'admin',
                        password: 'admin',
                        device_name: 'ji1111m-pc-windows7',
                        client_id: 'JsQCsjF3yr7KACyT',
                        client_secret: 'bqGeM4Yrjs3tncJZ'
                    }
                }, function(body) { 
                    done()
                })
            })
        })
        it(protocol + ' oauth2/token 400', function*(done) {
            var res = yield request(app)
                .post('/api/v1/oauth2/token')
                .type('json')
                .expect(400)
                .end()
            done()
        })
        it(protocol + ' oauth2/token 401 member not exist or disable', function*(done) {
            var res = yield request(app)
                .post('/api/v1/oauth2/token')
                .type('json')
                .send({
                    name: 'admin1',
                    password: 'admin',
                    device_name: 'ji1111m-pc-windows7',
                    client_id: 'JsQCsjF3yr7KACyT',
                    client_secret: 'bqGeM4Yrjs3tncJZ'
                })
                .expect(401)
                .end()
            res.body.error.should.equal('invalid_grant')
            res.body.error_description.should.equal('user not exist or disable.')
            done()
        })
        it(protocol + ' oauth2/token 401 incorrect password', function*(done) {
            var res = yield request(app)
                .post('/api/v1/oauth2/token')
                .type('json')
                .send({
                    name: 'admin',
                    password: 'admin1',
                    device_name: 'ji1111m-pc-windows7',
                    client_id: 'JsQCsjF3yr7KACyT',
                    client_secret: 'bqGeM4Yrjs3tncJZ'
                })
                .expect(401)
                .end()
            res.body.error.should.equal('invalid_grant')
            res.body.error_description.should.equal('incorrect password.')
            done()
        })
        it(protocol + ' oauth2/token 401 member locked', function*(done) {
            //ready data
            var MiniUserMeta = require('../../lib/model/user-meta')
            var meta = yield MiniUserMeta.create(1, 'password_error_count', '6')
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
                .expect(401)
                .end()
            res.body.error.should.equal('invalid_grant')
            res.body.error_description.should.equal('user is locked,enter the wrong password over five times.please try again after 15 minutes.')
                //reset password status
            yield MiniUserMeta.create(1, 'password_error_count', '0')
            done()
        })
    })
})
