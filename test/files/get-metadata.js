var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/get_metadata', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniUser = null
    var user = null
    var file = null
    var device = null
    var addUser = null
    var MiniTag = null
    var MiniFile = null
    var MiniFileTagRelation = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
        var MiniVersion = require('../../lib/model/version')
        MiniFile = require('../../lib/model/file')
        MiniFileTagRelation = require('../../lib/model/file-tag-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        yield MiniTag.create(user.id, 'file')
        yield MiniTag.create(user.id, 'folder')
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
        var version = yield MiniVersion.create('X1234567', 1073741825)
        file = yield MiniFile.createFile(device, '/Image/123/1.doc', version, null)
        var fileTag2 = yield MiniTag.getByName(user.id, 'green')
        var fileTag3 = yield MiniTag.getByName(user.id, 'white')
        yield MiniFileTagRelation.create(fileTag2.id, file.id)
        yield MiniFileTagRelation.create(fileTag3.id, file.id)
        var file2 = yield MiniFile.createFolder(device, '/LIGht/好/')
        yield MiniFileTagRelation.create(fileTag2.id, file2.id)
        var file3 = yield MiniFile.createFolder(device, '/LIGht/好/123')
        var version2 = yield MiniVersion.create('X2234567', 1107374182)
        var file4 = yield MiniFile.createFile(device, '/Image/123/hello.doc', version2, null)
            // var file5 = yield MiniFile.createFolder(device, '/Image/123/hello.doc')

        // var version3 = yield MiniVersion.create('X2234667', 1107373482)
        // var file6 = yield MiniFile.createFile(device, '/Image/123/hello.doc/aaa.doc', version3, null)
        return done()
    })

    it(protocol + ' files/get_metadata 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc'
            })
            .expect(200)
            .end()
        res.body.tag.should.equal('file,green,white')
        res.body.name.should.equal('1.doc')
        done()
    })
    it(protocol + ' files/get_metadata  socket.io  200', function*(done) {
        global.socket.emit('/api/v1/files/get_metadata', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                path: '/Image/123/1.doc'
            }
        }, function(body) {
            body.tag.should.equal('file,green,white')
            body.name.should.equal('1.doc')
            done()
        })
    })
    it(protocol + ' files/get_metadata 200 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/LIGht/好/'
            })
            .expect(200)
            .end()
        res.body.tag.should.equal('folder,green')
        res.body.name.should.equal('好')
        done()
    })
    it(protocol + ' files/get_metadata 200 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/LIGht/好/123'
            })
            .expect(200)
            .end()
        res.body.tag.should.equal('folder')
        res.body.name.should.equal('123')
        done()
    })
    it(protocol + ' files/get_metadata 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/hello.doc'
            })
            .expect(200)
            .end()
        res.body.tag.should.equal('file')
        res.body.name.should.equal('hello.doc')
        done()
    })
    it(protocol + ' files/get_metadata 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/get_metadata 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                path: '/LIGht/好/'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/get_metadata 409 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
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
    it(protocol + ' files/get_metadata 409 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/LIGht/好好好/'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })


})
