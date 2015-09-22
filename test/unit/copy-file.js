var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file.js', function() {
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
    it(protocol + ' copy file', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//测试A.doc'
        var file = yield MiniFile.createFile(device, filePath, version, null)
        var toPath = '/home/abc/测试B.doc'
        var toFile = yield MiniFile.copy(device, filePath, toPath)
            //assert file 
        assert.equal(toFile.version_id, version.id)
            //assert file meta
        var getRevs = yield MiniFileMeta.getRevs(file.path_lower)
        assert.equal(getRevs.length, 1)
            //assert file version meta
        var version = yield MiniVersion.getByHash('X1234567')
        assert.equal(version.ref_count, 2)
        done()
    })
    it(protocol + ' copy file autorename (1)', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//测试A.doc'
        var file = yield MiniFile.createFile(device, filePath, version, null)
        var toPath = '/home/abc/测试B.doc'
        var toFile = yield MiniFile.copy(device, filePath, toPath)
        assert.equal(toFile.name,'测试B (1).doc')
            //assert file 
        assert.equal(toFile.version_id, version.id)
            //assert file meta
        var getRevs = yield MiniFileMeta.getRevs(file.path_lower)
        assert.equal(getRevs.length, 1)
            //assert file version meta
        var version = yield MiniVersion.getByHash('X1234567')
        assert.equal(version.ref_count, 3)
        done()
    })
    it(protocol + ' copy folder', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var version = yield MiniVersion.create('X12345678', 1073741825, 'doc')
        var filePath = '/home/doc/DOCX/201508/测试目录/测试A.doc'
        var file = yield MiniFile.createFile(device, filePath, version, null)
        var version = yield MiniVersion.create('X123456789', 1073741825, 'doc')
        var filePath = '/home/doc/DOCX/201508/测试B.doc'
        var file = yield MiniFile.createFile(device, filePath, version, null)
        var toPath = '/home/doc-back'
        var toFile = yield MiniFile.copy(device, '/home/doc', toPath) 
        assert.equal(toFile.path_lower.indexOf(toPath)>0,true)
            //assert 
        filePath = '/home/doc-back/DOCX/201508/测试目录/测试A.doc'
        file = yield MiniFile.getByPath(user.id, filePath)
        assert.equal(file.name, '测试A.doc')
        filePath = '/home/doc-back/DOCX/201508/测试B.doc'
        file = yield MiniFile.getByPath(user.id, filePath)
        assert.equal(file.name, '测试B.doc')
        done()
    })
    it(protocol + ' copy folder autorename (1)', function*(done) {
        var toPath = '/home/doc-back'
        var toFile = yield MiniFile.copy(device, '/home/doc', toPath) 
        assert.equal(toFile.name,'doc-back (1)')
            //assert 
        filePath = '/home/doc-back (1)/DOCX/201508/测试目录/测试A.doc'
        file = yield MiniFile.getByPath(user.id, filePath) 
        assert.equal(file.name, '测试A.doc')
        filePath = '/home/doc-back (1)/DOCX/201508/测试B.doc'
        file = yield MiniFile.getByPath(user.id, filePath)
        assert.equal(file.name, '测试B.doc')
        done()
    })
})
