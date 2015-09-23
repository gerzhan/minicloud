var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' tags/files', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniUser = null
    var user = null
    var tag = null
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
        MiniFile = require('../../lib/model/file')
        MiniVersion = require('../../lib/model/version')
        MiniFileTagRelation = require('../../lib/model/file-tag-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        tag = yield MiniTag.create(user.id, 'green')

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
        file = yield MiniFile.createFolder(device, '/abc/test')
        yield MiniFileTagRelation.create(tag.id, file.id)
        version = yield MiniVersion.create('X1234567', 1073741825)
        file2 = yield MiniFile.createFile(device, '/Image/123/1.doc', version, null)
        yield MiniFileTagRelation.create(tag.id, file2.id)
        return done()
    })

    it(protocol + ' tags/files 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'green'
            })
            .expect(200)
            .end()
        res.body[0].name.should.equal('test')
        res.body[1].name.should.equal('1.doc')
        done()
    })
    it(protocol + 'tags/files socket.io  200', function*(done) {
        global.socket.emit('/api/v1/tags/files', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                name: 'green'
            }
        }, function(body) {
            body[0].name.should.equal('test')
            body[1].name.should.equal('1.doc')
            done()
        })
    })
    it(protocol + ' tags/files 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                name: 'green'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' tags/files 409 tag_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'greennnn'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('tag_not_exist')
        done()
    })
    it(protocol + ' tags/files 400 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })

})
