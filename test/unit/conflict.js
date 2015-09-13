var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' conflict.js', function() {
    this.timeout(global.timeout) 
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
    it(protocol + ' add mode not root path', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('X51', 1024, 'doc')
        var filePath = '/home/A.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
                client_modified: new Date().getTime()
            })
            //add mode 
        var filePath = '/home/a.doc'
        var version2 = yield MiniVersion.create('X52', 1024, 'doc')
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
            mode: 'add',
            client_modified: new Date().getTime()
        })
        assert.equal(file2.name, 'a (1).doc')
            //add mode 
        var filePath = '/home/A.doc'
        var version3 = yield MiniVersion.create('X53', 1024, 'doc')
        var file3 = yield MiniFile.createFile(device, filePath, version3, {
            mode: 'add',
            client_modified: new Date().getTime()
        })
        assert.equal(file3.name, 'A (2).doc')
            //add mode 
        var filePath = '/home/A.doc'
        var version4 = yield MiniVersion.create('X54', 1024, 'doc')
        var file4 = yield MiniFile.createFile(device, filePath, version4, {
            mode: 'add',
            client_modified: new Date().getTime()
        })
        assert.equal(file4.name, 'A (3).doc')
        done()
    })
    it(protocol + ' add mode root path', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('X51', 1024, 'doc')
        var filePath = '/A.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
                client_modified: new Date().getTime()
            })
            //add mode 
        var filePath = '/a.doc'
        var version2 = yield MiniVersion.create('X52', 1024, 'doc')
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
            mode: 'add',
            client_modified: new Date().getTime()
        })
        assert.equal(file2.name, 'a (1).doc')
            //add mode 
        var filePath = '/A.doc'
        var version3 = yield MiniVersion.create('X53', 1024, 'doc')
        var file3 = yield MiniFile.createFile(device, filePath, version3, {
            mode: 'add',
            client_modified: new Date().getTime()
        })
        assert.equal(file3.name, 'A (2).doc')
            //add mode 
        var filePath = '/A.doc'
        var version4 = yield MiniVersion.create('X54', 1024, 'doc')
        var file4 = yield MiniFile.createFile(device, filePath, version4, {
            mode: 'add',
            client_modified: new Date().getTime()
        })
        assert.equal(file4.name, 'A (3).doc')
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
        var filePath = '/home/测试a.doc'
        var version2 = yield MiniVersion.create('X12', 1024, 'doc')
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
            mode: 'overwrite',
            device_id: 1,
            client_modified: new Date().getTime()
        })
        assert(file2.name, '测试a.doc')
        assert(file2.id, file2.id)
            //overwrite mode
            //need set device_id
        var version3 = yield MiniVersion.create('X13', 1024, 'doc')
        var file3 = yield MiniFile.createFile(device, filePath, version3, {
            mode: 'overwrite',
            device_id: 1,
            client_modified: new Date().getTime()
        })
        var MiniFileMeta = require('../../lib/model/file-meta')
        var revs = yield MiniFileMeta.getRevs(file3.path_lower)
        assert(revs.length, 3)
        assert(revs[0].hash, 'X13')
        assert(revs[1].hash, 'X12')
        assert(revs[2].hash, 'X11')
        done()
    })
    it(protocol + ' update mode', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var version1 = yield MiniVersion.create('X71', 1024, 'doc')
        var version2 = yield MiniVersion.create('X72', 1024, 'doc')
        var version3 = yield MiniVersion.create('X73', 1024, 'doc')
        var version4 = yield MiniVersion.create('X74', 1024, 'doc')
        var version5 = yield MiniVersion.create('X75', 1024, 'doc')
        var filePath = '/home/Au.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
            client_modified: new Date().getTime()
        })
        assert.equal(file1.version_id, version1.id)
        var revs = yield MiniFileMeta.getRevs(file1.path_lower)
        assert.equal(revs.length, 1)

        //update mode 
        var file2 = yield MiniFile.createFile(device, filePath, version3, {
            mode: 'update',
            parent_hash: 'X72'
        })
        assert.equal(file2.version_id, version3.id)
        assert.equal(file2.name, 'Au (conflicted copy).doc')
        var revs = yield MiniFileMeta.getRevs(file2.path_lower)
        assert.equal(revs.length, 1)

        var file4 = yield MiniFile.createFile(device, filePath, version4, {
            mode: 'update',
            parent_hash: 'X72'
        })
        assert.equal(file4.version_id, version4.id)
        assert.equal(file4.name, 'Au (conflicted copy)(1).doc')
        var revs = yield MiniFileMeta.getRevs(file4.path_lower)
        assert.equal(revs.length, 1)
        var file5 = yield MiniFile.createFile(device, filePath, version5, {
            mode: 'update',
            parent_hash: 'X71'
        })
        assert.equal(file5.version_id, version5.id)
        assert.equal(file5.name, 'Au.doc')
        var revs = yield MiniFileMeta.getRevs(file5.path_lower)
        assert.equal(revs.length, 2)
        done()
    })
})
