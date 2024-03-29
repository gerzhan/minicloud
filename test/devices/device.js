var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' devices', function() {
    this.timeout(global.timeout)
    var app = null
    var accessToken = null
    before(function*(done) {
        //start server
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
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
            //set access_token
        accessToken = res.body.access_token
        return done()
    })

    it(protocol + ' devices/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/devices/list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
            //Determine Each element is in line with expectations
        var devices = res.body.devices
        devices.length.should.equal(2)
        devices[0].device_name.should.equal('web client')
        devices[1].device_name.should.equal('ji1111m-pc-windows7')
        done()
    })
    it(protocol + ' devices/list socket.io 200', function*(done) {
        global.socket.emit('/api/v1/devices/list', {
            header: {
                Authorization: 'Bearer ' + accessToken
            }
        }, function(body) {
            var devices = body.devices
            devices.length.should.equal(2)
            done()
        })
    })
    it(protocol + ' devices/list 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/devices/list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                limit: 'abc'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' devices/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/devices/list')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })

})
