var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/download', function() {
    this.timeout(10000)
    var app = null
    var user = null
    var device = null
    var filePath = null
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
        //ready data
        var MiniStorageNode = require('../../lib/model/store-node')
        var node1 = yield MiniStorageNode.create('store1', 'http://192.168.0.10', '1234')
        yield MiniStorageNode.setStatus(node1.name, true)
        yield MiniStorageNode.setDownloadCount(node1.name, 10)
        var node2 = yield MiniStorageNode.create('store2', 'http://192.168.0.11', '1234')
        yield MiniStorageNode.setStatus(node2.name, true)
        yield MiniStorageNode.setDownloadCount(node2.name, 5)

        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        var MiniVersionMeta = require('../../lib/model/version-meta')
        yield MiniVersionMeta.create(version.id, 'store_id', node1.id + ',' + node2.id)
        var MiniFile = require('../../lib/model/file')
        filePath = '/home/doc/DOCX/201508/测试目录/测试A.doc'
        yield MiniFile.createFile(device, filePath, version)
        return done()
    })
    it(protocol + ' files/download 400', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/download?access_token=' + accessToken)
            .type('json')
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/download 401', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/download?access_token=1234')
            .type('json')
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/download 409', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/download?access_token=' + accessToken + '&path=/zz/1.doc')
            .type('json')
            .expect(409)
            .end()
        res.body.error.should.equal('file_not_exist')
        done()
    })
    it(protocol + ' files/download  302 GET', function*(done) {
        var res = yield request(app)
            .get('/api/v1/files/download?access_token=' + accessToken + '&path=' + filePath)
            .expect(302)
            .end()
        var host = 'http://192.168.0.11'
        var url = res.header.location.substring(0, host.length)
        assert(url, host)
        done()
    })
    it(protocol + ' files/download  302 POST', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/download')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: filePath
            })
            .expect(302)
            .end()
        var host = 'http://192.168.0.11'
        var url = res.header.location.substring(0, host.length)
        assert(url, host)
        done()
    })
})
