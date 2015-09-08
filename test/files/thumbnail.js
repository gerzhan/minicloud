var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/thumbnail', function() {
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
    it(protocol + ' files/thumbnail 400', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/thumbnail?access_token=' + accessToken)
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/thumbnail 401', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/thumbnail?access_token=1234')
            .type('json')
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/thumbnail 409', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/thumbnail?access_token=' + accessToken + '&path=/zz/1.doc')
            .type('json')
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/thumbnail  302', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        var version = yield MiniVersion.create('X1234567', 1073741825, 'png')
        var filePath = '/home/doc/DOCX/201508/测试目录/测试A.png'
        yield MiniFile.createFile(device, filePath, version)

        var res = yield request(app)
            .get('/api/v1/files/thumbnail?access_token=' + accessToken + '&path=' + filePath + '&size=w64h64')
            .expect(302)
            .end()
        done()
    })
})
