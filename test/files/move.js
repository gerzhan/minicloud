var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/move', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var user = null
    var file = null
    var device = null
    var MiniTag = null
    var MiniFile = null
    var MiniEvent = null
    var MiniFileTagRelation = null
    var fileHelpers = null
    var version = null
    var version3 = null
    var MiniVersion = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
        MiniVersion = require('../../lib/model/version')
        fileHelpers = require('../../lib/file-helpers')
        MiniFile = require('../../lib/model/file')
        MiniEvent = require('../../lib/model/event')
        MiniFileTagRelation = require('../../lib/model/file-tag-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        yield MiniTag.create(user.id, 'green')
        yield MiniTag.create(user.id, 'white')

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
        var fileTag2 = yield MiniTag.getByName(user.id, 'green')
        var fileTag3 = yield MiniTag.getByName(user.id, 'white')
        yield MiniFileTagRelation.create(fileTag2.id, file.id)
        yield MiniFileTagRelation.create(fileTag3.id, file.id)
        var file2 = yield MiniFile.createFolder(device, '/LIGht/好/')
        yield MiniFileTagRelation.create(fileTag2.id, file2.id)
        var file3 = yield MiniFile.createFolder(device, '/LIGht/好/123/456')
        var file7 = yield MiniFile.createFolder(device, '/LIGht/好/123/789')
        var version2 = yield MiniVersion.create('X2234567', 1107374182, 'doc')
        var file4 = yield MiniFile.createFile(device, '/Image/123/hello.doc', version2, null)

        var file5 = yield MiniFile.createFolder(device, '/ab/cd/')
        var file5 = yield MiniFile.createFolder(device, '/aaa/好/ide')
        version3 = yield MiniVersion.create('X8888888', 1107374181, 'doc')
        var file6 = yield MiniFile.createFile(device, '/ef/gh/1.doc', version3, null)
        return done()
    })
    it(protocol + ' files/move 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/move 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                from_path: '/Image/123/1.doc',
                to_path: '/LIGht/1.doc'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/move 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                from_path: '/Image/123/2.doc',
                to_path: '/LIGht/2.doc'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/move 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                from_path: '/Image/123/1.doc',
                to_path: '/LIGht/1.doc'
            })
            .expect(200)
            .end()
        res.body.path_lower.should.equal('/light/1.doc')
        res.body.hash.should.equal(version.hash)
        done()
    })
    it(protocol + ' files/move 200 file autorename (1)', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                from_path: '/ef/gh/1.doc',
                to_path: '/LIGht/1.doc'
            })
            .expect(200)
            .end()
        res.body.path_lower.should.equal('/light/1 (1).doc')
        res.body.hash.should.equal(version3.hash)
        done()
    })
    it(protocol + ' files/move 200 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                from_path: '/LIGht/好',
                to_path: '/ab/cd/好'
            })
            .expect(200)
            .end()
        res.body.path_lower.should.equal('/ab/cd/好')
        done()
    })
    it(protocol + ' files/move 200 folder autorename (1)', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/move')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                from_path: '/aaa/好',
                to_path: '/ab/cd/好'
            })
            .expect(200)
            .end()
        res.body.path_lower.should.equal('/ab/cd/好 (1)')
        done()
    })

})
