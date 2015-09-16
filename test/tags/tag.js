var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' tags/files/tags', function() {
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

        return done()
    })
    it(protocol + ' tags/files/tags 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files/tags')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                file_path: '/abc/test'
            })
            .expect(200)
            .end()
        res.body[0].name.should.equal('green')
        done()
    })
    it(protocol + 'tags/files/tags socket.io  200', function*(done) {
        global.socket.emit('/api/v1/tags/files/tags', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                file_path: '/abc/test'
            }
        }, function(body) {
            body[0].name.should.equal('green')
            done()
        })
    })
    it(protocol + ' tags/files/tags 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files/tags')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                file_path: '/abc/test'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' tags/files/tags 409 file_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files/tags')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                file_path: '/abc/testttt'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('file_not_exist')
        done()
    })
    it(protocol + ' tags/files/tags 400 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files/tags')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
})
