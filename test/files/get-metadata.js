var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/get-metadata', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var user = null
    var file = null
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
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        file = yield MiniFile.createFile(user.id, '/Image/123/1.doc', version, null)
        var fileTagObj2 = yield MiniTag.getByName(user.id, 'green')
        var fileTag2 = fileTagObj2.dataValues
        yield MiniFileTagRelation.create(fileTag2.id, file.id)

        var file2 = yield MiniFile.createFolder(user.id, '/LIGht/好/')
        yield MiniFileTagRelation.create(fileTag2.id, file2.id)
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

    it(protocol + ' files/get-metadata 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get-metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc',
            })
            .expect(200)
            .end()
        res.body.tag.should.equal('file,green')
        res.body.name.should.equal('1.doc')
        done()
    })
    it(protocol + ' files/get-metadata 200 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get-metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/LIGht/好/',
            })
            .expect(200)
            .end()
        res.body.tag.should.equal('folder,green')
        res.body.name.should.equal('好')
        done()
    })
    it(protocol + ' files/get-metadata 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get-metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/get-metadata 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get-metadata')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                path: '/LIGht/好/',
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/get-metadata 409 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get-metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/2.doc',
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/get-metadata 409 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get-metadata')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/LIGht/好好好/',
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })


})
