var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' hook-file.js', function() {
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
    it(protocol + ' beforeCreate set pinyin', function*(done) {
        var file1 = yield MiniFile.createFolder(device, '//home//doc////DOCX//测试目录//')
        file1.file_name_pinyin.should.equal('ceshimulu|csml')
        done()
    })
    it(protocol + ' beforeUpdate set pinyin', function*(done) {
        var file1 = yield MiniFile.createFolder(device, '//home//doc////DOCX//测试目录//A测试')
        var file2 = yield MiniFile.createFolder(device, '//home//doc////DOCX//测试目录//a测试')
        file2.file_name_pinyin.should.equal('aceshi|acs')
        done()
    })
    it(protocol + ' beforeUpdate set version.refCount ', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('1X11', 1024, 'doc')
        var filePath = '/home/测试A1.doc'
        var file1 = yield MiniFile.createFile(device, filePath, version1, {
                client_modified: new Date().getTime()
            })
            //overwrite mode
            //need set device_id
        var filePath = '/home/测试a1.doc'
        var version2 = yield MiniVersion.create('1X12', 1024, 'doc') 
        assert.equal(version2.ref_count,0) 
        var file2 = yield MiniFile.createFile(device, filePath, version2, {
            mode: 'overwrite', 
            client_modified: new Date().getTime()
        }) 
        version2 = yield MiniVersion.getByHash('1X12')  
        assert.equal(version2.ref_count,1)
        done()
    })
})
