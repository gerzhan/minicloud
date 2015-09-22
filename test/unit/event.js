var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' event.js', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniFile = null
    var user = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        return done()
    })
    it(protocol + ' create login event', function*(done) {
        var MiniDevice = require('../../lib/model/device')
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
        var hasEvent = 0
        var MiniEvent = require('../../lib/model/event')
        var events = yield MiniEvent.getAllByDeviceId(device.id)
        for (var i = 0; i < events.length; i++) {
            var item = events[i]
            if (item.type === 1) {
                hasEvent = 1
                break
            }
        }
        assert.equal(hasEvent, 1)
        done()
    })
    it(protocol + ' create logout event', function*(done) {
        var MiniEvent = require('../../lib/model/event')
        yield MiniEvent.createLogoutEvent('127.0.0.1', device)
        var events = yield MiniEvent.getAllByDeviceId(device.id)
        var logoutItem = null
        for (var i = 0; i < events.length; i++) {
            var item = events[i]
            if (item.type === 2) {
                logoutItem = item
            }
        }
        assert.equal(logoutItem.type, 2)
        done()
    })
    it(protocol + ' file/folder create event', function*(done) {
        //upload to minicloud
        var MiniFileUploadSession = require('../../lib/model/file-upload-session')
        var session = yield MiniFileUploadSession.create()
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
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var MiniEvent = require('../../lib/model/event')
        var fileItem = null
        var folderItem = null
        var events = yield MiniEvent.getAllByDeviceId(device.id)
        for (var i = 0; i < events.length; i++) {
            var item = events[i]
            if (item.type === 4) {
                if (item.path_lower == '/' + user.id + '/home') {
                    folderItem = item
                }
                if (item.path_lower == '/' + user.id + '/home/x1.doc') {
                    fileItem = item
                }
            }
        }

        assert.equal(folderItem.context, JSON.stringify({
            file_type: 1,
            name: 'home'
        }))
        assert.equal(fileItem.context, JSON.stringify({
            file_type: 0,
            name: 'X1.doc'
        }))
        done()

    })
    it(protocol + ' file/folder move event', function*(done) {
        var MiniFile = require('../../lib/model/file')
        var MiniVersion = require('../../lib/model/version')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var MiniEvent = require('../../lib/model/event')
        var version = yield MiniVersion.create('X12345678', 1073741825, 'doc')
        var filePath = '/home/doc/DOCX/201508/测试目录/测试A.doc'
        var file = yield MiniFile.createFile(device, filePath, version)
        var version = yield MiniVersion.create('X123456789', 1073741825, 'doc')
        var filePath = '/home/doc/DOCX/201508/测试B.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version)
        var toPath = '/home/doc-back'
        var toFile = yield MiniFile.move(device, '/home/doc', toPath)
        var fileItem = null
        var events = yield MiniEvent.getAllByDeviceId(device.id)
        for (var i = 0; i < events.length; i++) {
            var item = events[i]
            if (item.type === 8) {
                if (item.path_lower == '/' + user.id + '/home/doc-back/docx/201508/测试b.doc') {
                    fileItem = item
                }
            }
        }
        assert.equal(JSON.parse(fileItem.context).name, '测试B.doc')
        done()
    })
    it(protocol + ' file/folder delete event', function*(done) {
        var MiniEvent = require('../../lib/model/event')
        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/home/doc-back'
            })
            .expect(200)
            .end()
        var fileItem = null
        var events = yield MiniEvent.getAllByDeviceId(device.id)
        for (var i = 0; i < events.length; i++) {
            var item = events[i]
            if (item.type === 16) {
                if (item.path_lower == '/' + user.id + '/home/doc-back') {
                    fileItem = item
                }
            }
        }
        assert.equal(fileItem.context, JSON.stringify({
            file_type: 1,
            descendant_count: 6
        }))
        done()
    })
    it(protocol + ' event/list', function*(done) {
        var MiniEvent = require('../../lib/model/event')
        var page = yield MiniEvent.getList({
            user_id: device.user_id
        })
        assert.equal(page.count, 17)
        done()
    })
})
