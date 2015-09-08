var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/hash_upload', function() {
    this.timeout(10000)
    var app = null
    var accessToken = null
    var accessToken1 = null
    var user = null
    var user1 = null
    var deivce = null
    before(function*(done) {
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        user1 = yield MiniUser.create('admin1', 'admin1')
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
            //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        //set access_token
        accessToken = res.body.access_token
        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'admin1',
                password: 'admin1',
                device_name: 'ji1111m-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
            //set access_token
        accessToken1 = res.body.access_token
        return done()
    })
    it(protocol + ' files/hash_upload 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/hash_upload 400 error mode', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                mode: 'update1',
                hash: 'xxxxx',
                path: '/home/a.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        res.body.error_description[0].mode.should.equal('not support mode.')
        done()
    })
    it(protocol + ' files/hash_upload 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .set({
                Authorization: 'Bearer 123'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/hash_upload 409 hash_not_existed', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'X123456',
                'path': '/home/x.docx'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end()
        res.body.error.should.equal('hash_not_existed')
        done()
    })
    it(protocol + ' files/hash_upload 409 option.site_default_space over_space', function*(done) {
        //ready data
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('site_default_space', '1024')
        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.create('X123456', 1073741825, 'doc')
        var version1 = yield MiniVersion.create('X1', 1, 'doc')
        var MiniFile = require('../../lib/model/file')
        yield MiniFile.createFile(device, '/home/d.doc', version1, null)
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'X123456',
                'path': '/home/x.docx'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end()
        res.body.error.should.equal('over_space')
        done()
    })
    it(protocol + ' files/hash_upload 409 user.meta over_space', function*(done) {
        //ready data
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniUserMeta.create(user.id, 'space', '1024')
        var MiniVersion = require('../../lib/model/version')
        yield MiniVersion.create('X123456', 1073741825, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'X123456',
                'path': '/home/x.docx'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end()
        res.body.error.should.equal('over_space')
        done()
    })
    it(protocol + ' files/hash_upload mode:add', function*(done) {
        //ready data
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniUserMeta.create(user1.id, 'space', '10240')
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        yield MiniVersion.create('H2', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'H2',
                'path': '/home/X2.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var file = yield MiniFile.getByPath(user1.id, '/home/x2.doc')
        file.name.should.equal('X2.doc')
        var version = yield MiniVersion.getByHash('H2')
        version.ref_count.should.equal(1)
            //second
        yield MiniVersion.create('H3', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'H3',
                'path': '/home/x2.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        res.body.name.should.equal('x2 (1).doc')
            //third
        yield MiniVersion.create('H4', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'H4',
                'path': '/home/x2.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        res.body.name.should.equal('x2 (2).doc')
        done()
    })
    it(protocol + ' files/hash_upload mode:overwrite', function*(done) {
        //ready data
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniUserMeta.create(user1.id, 'space', '10240')
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        var MiniFileMeta = require('../../lib/model/file-meta')
        yield MiniVersion.create('H21', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'mode': 'overwrite',
                'hash': 'H21',
                'path': '/home/X3.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var file = yield MiniFile.getByPath(user1.id, '/home/X3.doc')
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        revs.length.should.equal(1)
        yield MiniVersion.create('H22', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'mode': 'overwrite',
                'hash': 'H22',
                'path': '/home/x3.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        revs.length.should.equal(2)
        done()
    })
    it(protocol + ' files/hash_upload mode:update', function*(done) {
        //ready data
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniUserMeta.create(user1.id, 'space', '10240')
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        var MiniFileMeta = require('../../lib/model/file-meta')
        yield MiniVersion.create('H31', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'mode': 'update',
                'hash': 'H31',
                'path': '/home/X4.doc',
                'parent_hash': ''
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var file = yield MiniFile.getByPath(user1.id, '/home/X4.doc')
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        revs.length.should.equal(1)

        yield MiniVersion.create('H32', 1234, 'doc')
        yield MiniVersion.create('H33', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'mode': 'update',
                'hash': 'H33',
                'path': '/home/X4.doc',
                'parent_hash': 'H32'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        res.body.name.should.equal('X4 (conflicted copy).doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'mode': 'update',
                'hash': 'H33',
                'path': '/home/X4.doc',
                'parent_hash': 'H32'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        res.body.name.should.equal('X4 (conflicted copy)(1).doc')
        done()
    })
})
