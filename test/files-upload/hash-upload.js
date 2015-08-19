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
    before(function*(done) {
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
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
        var version = yield MiniVersion.create('X123456', 1073741825, 'doc')
        var version1 = yield MiniVersion.create('X1', 1, 'doc')
        var MiniFile = require('../../lib/model/file') 
        yield MiniFile.createFile(user.id,'/home/d.doc',version1,null)
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
        version.ref_count.should.equal(2)
        done()
    })
})
