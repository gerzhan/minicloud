var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/hash_upload', function() {
    this.timeout(10000)
    var app = null
    var accessToken = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
            //ready data
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
    it(protocol + ' files/hash_upload 409 hash_not_exists', function*(done) {
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
        res.body.error.should.equal('hash_not_exists')
        done()
    })
    it(protocol + ' files/hash_upload 409 option.site_default_space over_space', function*(done) {
        //ready data
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('site_default_space', '1024')
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
    it(protocol + ' files/hash_upload 200', function*(done) {
        //ready data
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniUserMeta.create(user.id, 'space', '10240')
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        yield MiniVersion.create('X123456', 1234, 'doc')
        var res = yield request(app)
            .post('/api/v1/files/hash_upload')
            .type('json')
            .send({
                'hash': 'X123456',
                'path': '/home/X.docx'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var file = yield MiniFile.getByPath(user.id, '/home/x.docx')
        file.name.should.equal('X.docx')
        var version = yield MiniVersion.getByHash('X123456')
        version.ref_count.should.equal(2)
        done()
    })
})
