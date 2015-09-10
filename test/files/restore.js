var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/restore', function() {
    this.timeout(10000)
    var app = null
    var user = null
    var file = null
    var device = null
    var MiniVersion = null
    var MiniFile = null
    var MiniUser = null
    var version = null
    var version2 = null
    var MiniFileMeta = null
    var fileHelpers = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        MiniFile = require('../../lib/model/file')
        MiniVersion = require('../../lib/model/version')
        var MiniDevice = require('../../lib/model/device')
        MiniFileMeta = require('../../lib/model/file-meta')
        fileHelpers = require('../../lib/file-helpers')
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
        version2 = yield MiniVersion.create('X12', 10737418, 'doc')
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
    it(protocol + ' files/restore 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/restore')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/restore 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/restore')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                path: '/Image/123/1.doc',
                hash: 'X1234567'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/restore 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/restore')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/2.doc',
                hash: 'X1234567'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/restore 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/restore')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc',
                hash: 'X2123456'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('hash_not_exist')
        done()
    })
    it(protocol + ' files/restore 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/restore')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc',
                hash: 'X12'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('hash_not_exist')
        done()
    })
    it(protocol + ' files/restore 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/restore')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc',
                hash: 'X1234567'
            })
            .expect(200)
            .end()
        var lowerPath = fileHelpers.lowerPath(user.id, '/Image/123/1.doc')
        var revs = yield MiniFileMeta.getRevs(lowerPath)
        revs.length.should.equal(3)
        revs[0].hash.should.equal('X1234567')
        done()
    })

})
