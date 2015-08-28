var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/delete', function() {
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
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
        var MiniVersion = require('../../lib/model/version')
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
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        file = yield MiniFile.createFile(device, '/Image/123/1.doc', version, null)
        var fileTag2 = yield MiniTag.getByName(user.id, 'green')
        var fileTag3 = yield MiniTag.getByName(user.id, 'white')
        yield MiniFileTagRelation.create(fileTag2.id, file.id)
        yield MiniFileTagRelation.create(fileTag3.id, file.id)
        var file2 = yield MiniFile.createFolder(device, '/LIGht/好/')
        yield MiniFileTagRelation.create(fileTag2.id, file2.id)
        var file3 = yield MiniFile.createFolder(device, '/LIGht/好/123')
        var version2 = yield MiniVersion.create('X2234567', 1107374182, 'doc')
        var file4 = yield MiniFile.createFile(device, '/Image/123/hello.doc', version2, null)

        var file5 = yield MiniFile.createFolder(device, '/ab/cd/')
        var version3 = yield MiniVersion.create('X8888888', 1107374181, 'doc')
        var file6 = yield MiniFile.createFile(device, '/ef/gh/i.doc', version3, null)
        return done()
    })
    it(protocol + ' files/delete 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/delete 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
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
    it(protocol + ' files/delete 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
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
    it(protocol + ' files/delete 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: ['zz', 'kk']
            })
            .expect(409)
            .end()
        res.body.error.should.equal('path_not_exist')
        done()
    })
    it(protocol + ' files/delete 200 file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc'
            })
            .expect(200)
            .end()
        var deleteFileList = yield MiniFile.getByPath(user.id, '/Image/123/1.doc')
        deleteFileList.is_deleted.should.equal(true)
        var eventList = yield MiniEvent.getAllEventsByDeviceId(device.id)
        var flag = false
        for (var i = 0; i < eventList.length; i++) {
            if (eventList[i].type === 0) {
                var context = JSON.parse(eventList[i].context)
                if (context.action === 3 && context.file_id === file.id && context.summary.file_name === file.name)
                    flag = true
            }
        }
        flag.should.equal(true)
        done()
    })

    it(protocol + ' files/delete 200 folder', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: 'LIGht'
            })
            .expect(200)
            .end()
        var deleteFileList = yield MiniFile.getChildrenByPath(user.id, 'LIGht')
        deleteFileList.length.should.equal(3)
        deleteFileList[2].is_deleted.should.equal(true)
        var eventList = yield MiniEvent.getAllEventsByDeviceId(device.id)
        var flag = false
        for (var i = 0; i < eventList.length; i++) {
            if (eventList[i].type === 0) {
                var context = JSON.parse(eventList[i].context)
                if (context.action === 3 && context.file_id === file.id && context.summary.file_name === file.name)
                    flag = true
            }
        }
        flag.should.equal(true)
        done()
    })
    it(protocol + ' files/delete 200 folder and file', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: ['ab', 'ef']
            })
            .expect(200)
            .end()
        var deleteFileList = yield MiniFile.getChildrenByPath(user.id, 'ab')
        deleteFileList.length.should.equal(2)
        deleteFileList[1].is_deleted.should.equal(true)
        var deleteFileList2 = yield MiniFile.getChildrenByPath(user.id, 'ef')
        deleteFileList2.length.should.equal(3)
        deleteFileList2[2].is_deleted.should.equal(true)
        var eventList = yield MiniEvent.getAllEventsByDeviceId(device.id)
        var flag = false
        for (var i = 0; i < eventList.length; i++) {
            if (eventList[i].type === 0) {
                var context = JSON.parse(eventList[i].context)
                if (context.action === 3 && context.file_id === file.id && context.summary.file_name === file.name)
                    flag = true
            }
        }
        flag.should.equal(true)
        done()
    })
})
