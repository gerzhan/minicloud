var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/list_folder', function() {
    this.timeout(10000)
    var app = null
    var user = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')

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
        var MiniDevice = require('../../lib/model/device')
            //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        return done()
    })
    it(protocol + ' files/list_folder 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
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
    it(protocol + ' files/list_folder 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                path: '/Image/123/1.doc'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/list_folder 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/zz/'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/list_folder 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/zz/'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
})
