var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/upload_session/start', function() {
    this.timeout(global.timeout)
    var app = null
    var accessToken = null
    var device = null
    before(function*(done) {
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin')

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
            //get current device
        var MiniDevice = require('../../lib/model/device')
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        //set access_token
        accessToken = res.body.access_token
        return done()
    })
    it(protocol + ' files/upload_session/start request_host 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/upload_session/start')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var host = res.body.store_host
        var pos = host.indexOf('http://127.0.0.1')
        assert.equal(pos, 0)
        done()
    })
    it(protocol + ' files/upload_session/start request_host socket.io  200', function*(done) {
        global.socket.emit('/api/v1/files/upload_session/start', {
            header: {
                Authorization: 'Bearer ' + accessToken
            }
        }, function(body) {
            var host = body.store_host
            var pos = host.indexOf('http://0.0.0.0')
            assert.equal(pos, 0)
            done()
        })
    })
    it(protocol + ' files/upload_session/start option.minicloud_host 200', function*(done) {
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('minicloud_host', 'http://demo.minicloud.io')

        var res = yield request(app)
            .post('/api/v1/files/upload_session/start')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body.store_host.should.equal('http://demo.minicloud.io')
        done()
    })

    it(protocol + ' files/upload_session/start 200', function*(done) {
        var MiniStorageNode = require('../../lib/model/store-node')
        var node1 = yield MiniStorageNode.create('store1', 'http://192.168.0.10', '1234')
        yield MiniStorageNode.setStatus(node1.name, 1)
        yield MiniStorageNode.setSaveCount(node1.name, 10)
        var node2 = yield MiniStorageNode.create('store2', 'http://192.168.0.11', '1234')
        yield MiniStorageNode.setStatus(node2.name, 1)
        yield MiniStorageNode.setSaveCount(node2.name, 5)
        var MiniOption = require('../../lib/model/option')
        var plugins = {
            cqdx: {
                type: 'thirdUserSource',
                name: 'userSource'
            },
            miniSearch: {
                type: 'miniSearch',
                name: 'miniSearch'
            },
            miniStore: {
                type: 'miniStore',
                name: 'miniStore'
            },
            miniDoc: {
                type: 'miniDoc',
                name: 'miniDoc'
            }
        }
        yield MiniOption.create('active_plugins', JSON.stringify(plugins))
        var res = yield request(app)
            .post('/api/v1/files/upload_session/start')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body.store_host.should.equal('http://192.168.0.11')
        done()
    })
    it(protocol + ' files/upload_session/start 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/upload_session/start')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/upload_session/start 409', function*(done) {
        var MiniStorageNode = require('../../lib/model/store-node')
        var node1 = yield MiniStorageNode.create('store1', 'http://192.168.0.10', '1234')
        yield MiniStorageNode.setSaveCount(node1.name, 10)
        yield MiniStorageNode.setStatus(node1.name, 0)
        var node2 = yield MiniStorageNode.create('store2', 'http://192.168.0.11', '1234')
        yield MiniStorageNode.setSaveCount(node2.name, 5)
        yield MiniStorageNode.setStatus(node2.name, 0)
        var MiniOption = require('../../lib/model/option')
        var plugins = {
            cqdx: {
                type: 'thirdUserSource',
                name: 'userSource'
            },
            miniSearch: {
                type: 'miniSearch',
                name: 'miniSearch'
            },
            miniStore: {
                type: 'miniStore',
                name: 'miniStore'
            },
            miniDoc: {
                type: 'miniDoc',
                name: 'miniDoc'
            }
        }
        yield MiniOption.create('active_plugins', JSON.stringify(plugins))
        var res = yield request(app)
            .post('/api/v1/files/upload_session/start')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end()
        res.body.error.should.equal('no_valid_minicloud_storage_node')
        done()
    })
    it(protocol + ' files/upload_session/start 409 option.site_default_space over_space', function*(done) {
        //ready data
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('site_default_space', '1024')
        var MiniVersion = require('../../lib/model/version')
        var version = yield MiniVersion.create('X123456', 1024*1024*1024)
        var MiniFile = require('../../lib/model/file')
        yield MiniFile.createFile(device, '/home/d.doc', version, null)
        var res = yield request(app)
            .post('/api/v1/files/upload_session/start')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end() 
        res.body.error.should.equal('over_space')
        done()
    })
})
