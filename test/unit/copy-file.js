var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file.js', function() {
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
    it(protocol + ' copy file', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var MiniFileMeta = require('../../lib/model/file-meta')
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        var filePath = '//ho\\me//d:o*c////DO"CX//201?508/测<>试*:目|录//测试A.doc'
        var file = yield MiniFile.createFile(device,filePath,version,null)
        var toPath = '/home/abc/测试B.doc'
        yield MiniFile.copy(device,filePath,toPath)
        //assert file
        var toFile = yield MiniFile.getByPath(user.id,toPath)
        assert(toFile.version_id,version.id)
        //assert file meta
        var meta = yield MiniFileMeta.getByKey(file.id,'versions')
        var reversions = JSON.parse(meta.value)
        assert(reversions.length,1)
        //assert file version meta
        var version = yield MiniVersion.getByHash('X1234567') 
        assert(version.ref_count,2)
        done()
    })
    it(protocol + ' copy folder', function*(done) {
        done()
    })
})
