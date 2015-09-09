var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/list_revision', function() {
    this.timeout(10000)
    var app = null
    var user = null
    var file = null
    var device = null
    var MiniVersion = null
    var MiniFile = null
    var MiniUser = null
    var version = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        MiniFile = require('../../lib/model/file')
        MiniVersion = require('../../lib/model/version')
        var MiniDevice = require('../../lib/model/device')
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
            //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        file = yield MiniFile.createFile(device, '/Image/123/1.doc', version, null)
        yield MiniVersion.create('H21', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'mode': 'overwrite',
                'hash': 'H21',
                'path': '/Image/123/1.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        return done()
    })
    it(protocol + ' files/list_revision 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_revision')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/list_revision 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_revision')
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
    it(protocol + ' files/list_revision 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_revision')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/2.doc'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/list_revision 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_revision')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc'
            })
            .expect(200)
            .end()
        res.body.length.should.equal(2)
        res.body[0].hash.should.equal('H21')
        res.body[1].hash.should.equal('X1234567')
        done()
    })
    it(protocol + ' files/list_revision  socket.io  200', function*(done) {
        global.socket.emit('/api/v1/files/list_revision', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                path: '/Image/123/1.doc'
            }
        }, function(body) {
            body.length.should.equal(2)
            body[0].hash.should.equal('H21')
            body[1].hash.should.equal('X1234567')
            done()
        })
    })

})
