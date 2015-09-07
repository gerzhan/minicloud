var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/list_folder', function() {
    this.timeout(10000)
    var app = null
    var user = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()
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
        var MiniDevice = require('../../lib/model/device')
            //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        return done()
    })
    it(protocol + ' files/list_folder 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                limit: 'abc'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/list_folder 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                path: '/Image/123/1.doc'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/list_folder 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/zz/'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/list_folder root path 200', function*(done) {
        //ready data
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        for (var i = 0; i < 15; i++) {
            yield MiniFile.createFolder(device, '/folder' + i)
            yield MiniFile.createFile(device, '/' + i + '.docx', version)
        }
        //first page
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                limit: 10
            })
            .expect(200)
            .end()
        var body = res.body
        assert(body.files.length, 10)
        var cursor1 = res.body.cursor
            //second page 
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                limit: 10,
                cursor: cursor1
            })
            .expect(200)
            .end()
        var body = res.body
        assert(body.files.length, 10)
        var cursor2 = res.body.cursor
            //third page 
        var res = yield request(app)
            .post('/api/v1/files/list_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                limit: 10,
                cursor: cursor2
            })
            .expect(200)
            .end()
        var body = res.body
        assert(body.files.length, 10)
        var isOver = 1
        if (body.has_more) {
            isOver = 0
        }
        assert(isOver, 1)
        done()
    })
})
