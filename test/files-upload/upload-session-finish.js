var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/upload_session/finish', function() {
    this.timeout(global.timeout)
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
    it(protocol + ' files/upload_session/finish 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/upload_session/finish 400 error mode', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                mode: 'update1',
                hash: 'xxxxx',
                path: '/home/a.doc',
                session_id: 'xxxxx',
                size: 1234
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        res.body.error_description[0].mode.should.equal('not support mode.')
        done()
    })
    it(protocol + ' files/upload_session/finish 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .set({
                Authorization: 'Bearer 123'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/upload_session/finish 409 session_id_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                hash: 'xxxxx',
                path: '/home/a.doc',
                session_id: 'xxxxx',
                size: 1234
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end()
        res.body.error.should.equal('session_id_not_exist')
        done()
    })
    it(protocol + ' files/upload_session/finish mode:add', function*(done) {
        //upload to minicloud
        var MiniFileUploadSession = require('../../lib/model/file-upload-session')
        var session = yield MiniFileUploadSession.create()
        var MiniFile = require('../../lib/model/file')
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'session_id': session.session_id,
                'hash': 'H1',
                'size': 1024,
                'path': '/home/X1.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var file = yield MiniFile.getByPath(user1.id, '/home/x1.doc')
        file.name.should.equal('X1.doc')
        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.getByHash('H1')
        version.ref_count.should.equal(1)
        var MiniFileVersionMeta = require('../../lib/model/version-meta')
        var meta = yield MiniFileVersionMeta.getByKey(version.id, 'store_id')
        if (!meta) {
            assert(1, 1)
        } else {
            assert(0, 1)
        }
        //upload to minicloud storage
        var MiniFileUploadSession = require('../../lib/model/file-upload-session')
        var session = yield MiniFileUploadSession.create(4)
        var MiniFile = require('../../lib/model/file')
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'session_id': session.session_id,
                'hash': 'H2',
                'size': 1024,
                'path': '/home/X2.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var file = yield MiniFile.getByPath(user1.id, '/home/x2.doc')
        file.name.should.equal('X2.doc')
        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.getByHash('H2')
        version.ref_count.should.equal(1)
        var MiniFileVersionMeta = require('../../lib/model/version-meta')
        var meta = yield MiniFileVersionMeta.getByKey(version.id, 'store_id')
        meta.value.should.equal('4')
            //upload to minicloud storage second 
        var session = yield MiniFileUploadSession.create(4)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'session_id': session.session_id,
                'hash': 'H3',
                'size': 1024,
                'path': '/home/x2.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        res.body.name.should.equal('x2 (1).doc')
            //upload to minicloud storage third  
        var session = yield MiniFileUploadSession.create(4)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'session_id': session.session_id,
                'hash': 'H4',
                'size': 1024,
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
    it(protocol + ' files/upload_session/finish mode:overwrite', function*(done) {
        //upload to minicloud
        var MiniFileUploadSession = require('../../lib/model/file-upload-session')
        var session = yield MiniFileUploadSession.create()
        var MiniFile = require('../../lib/model/file')
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'mode': 'overwrite',
                'session_id': session.session_id,
                'hash': 'H21',
                'size': 1024,
                'path': '/home/X3.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
            //only one version
        var file = yield MiniFile.getByPath(user1.id, '/home/X3.doc')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        revs.length.should.equal(1)
            //second upload
        var session = yield MiniFileUploadSession.create(4)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'mode': 'overwrite',
                'session_id': session.session_id,
                'hash': 'H22',
                'size': 1024,
                'path': '/home/X3.doc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
            //two versions
        var file = yield MiniFile.getByPath(user1.id, '/home/X3.doc')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        revs.length.should.equal(2)
        done()
    })
    it(protocol + ' files/upload_session/finish mode:update', function*(done) {
        //upload to minicloud
        var MiniFileUploadSession = require('../../lib/model/file-upload-session')
        var session = yield MiniFileUploadSession.create(4)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'mode': 'update',
                'session_id': session.session_id,
                'hash': 'H31',
                'size': 1234,
                'path': '/home/X4.doc',
                'parent_hash': ''
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        var MiniFile = require('../../lib/model/file')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var file = yield MiniFile.getByPath(user1.id, '/home/X4.doc')
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        revs.length.should.equal(1)
            //new create version
        var MiniVersion = require('../../lib/model/version')
        yield MiniVersion.create('H32', 1234, 'doc')
            //second
        var session = yield MiniFileUploadSession.create(4)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'mode': 'update',
                'session_id': session.session_id,
                'hash': 'H33',
                'size': 1234,
                'path': '/home/X4.doc',
                'parent_hash': 'H32'
            })
            .set({
                Authorization: 'Bearer ' + accessToken1
            })
            .expect(200)
            .end()
        res.body.name.should.equal('X4 (conflicted copy).doc')
            //third
        var session = yield MiniFileUploadSession.create(4)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/finish')
            .type('json')
            .send({
                'mode': 'update',
                'session_id': session.session_id,
                'hash': 'H33',
                'size': 1234,
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
