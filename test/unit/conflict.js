var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' conflict.js', function() {
    this.timeout(10000)
    var app = null
    var MiniFile = null
    var user = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()
        MiniFile = require('../../lib/model/file')
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
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
    it(protocol + ' add mode', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('X51', 1024, 'doc')
        var filePath = '/home/A.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
                client_modified: new Date().getTime()
            })
            //add mode
            //need set device_id
        var version2 = yield MiniVersion.create('X52', 1024, 'doc')
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
            mode: 'add',
            device_id: 1,
            client_modified: new Date().getTime()
        })
        done()
    })
    it(protocol + ' overwrite mode', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('X11', 1024, 'doc')
        var filePath = '/home/测试A.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
                client_modified: new Date().getTime()
            })
            //overwrite mode
            //need set device_id
        var version2 = yield MiniVersion.create('X12', 1024, 'doc')
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
                mode: 'overwrite',
                device_id: 1,
                client_modified: new Date().getTime()
            })
            //overwrite mode
            //need set device_id
        var version3 = yield MiniVersion.create('X13', 1024, 'doc')
        var file3 = yield MiniFile.createFile(device, filePath, version3, {
            mode: 'overwrite',
            device_id: 1,
            client_modified: new Date().getTime()
        })
        var MiniFileMeta = require('../../lib/model/file-meta')
        var meta = yield MiniFileMeta.getByKey(file3.id, 'versions')
        assert(meta.versions.length, 2)
        assert(meta.versions[0].hash, 'X12')
        assert(meta.versions[1].hash, 'X11')
        done()
    })
    it(protocol + ' update mode', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('X71', 1024, 'doc')
        var filePath = '/home/A.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
                client_modified: new Date().getTime()
            })
            //update mode
            //need set device_id
        var version2 = yield MiniVersion.create('X72', 1024, 'doc')
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
            mode: 'update',
            device_id: 1,
            client_modified: new Date().getTime()
        })
        done()
    })
})
