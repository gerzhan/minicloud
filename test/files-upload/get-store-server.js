var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' files/get_store_server', function() {
    this.timeout(10000)
    var app = null
    var accessToken = null
    before(function*(done) {
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        yield MiniUser.create('admin', 'admin')

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
        return done()
    })
    it(protocol + ' files/get_store_server request_host 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_store_server')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var host = res.body.host
        var pos = host.indexOf('http://127.0.0.1')
        assert.equal(pos, 0)
        done()
    })
    it(protocol + ' files/get_store_server option.minicloud_host 200', function*(done) {
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('minicloud_host', 'http://demo.minicloud.io')

        var res = yield request(app)
            .post('/api/v1/files/get_store_server')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body.host.should.equal('http://demo.minicloud.io')
        done()
    })

    it(protocol + ' files/get_store_server 200', function*(done) {
        var MiniStorageNode = require('../../lib/model/store-node')
        var node1 = yield MiniStorageNode.create('store1', 'http://192.168.0.10', '1234')
        yield MiniStorageNode.setStatus(node1.name, true)
        yield MiniStorageNode.setSaveCount(node1.name, 10)
        var node2 = yield MiniStorageNode.create('store2', 'http://192.168.0.11', '1234')
        yield MiniStorageNode.setStatus(node2.name, true)
        yield MiniStorageNode.setSaveCount(node2.name, 5)
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('active_plugins', 'a:6:{s:4:"cqdx";a:2:{s:4:"type";s:15:"thirdUserSource";s:4:"name";s:21:"重庆党校用户源";}s:10:"miniSearch";a:2:{s:4:"type";s:10:"miniSearch";s:4:"name";s:12:"迷你搜索";}s:9:"miniStore";a:2:{s:4:"type";s:9:"miniStore";s:4:"name";s:12:"迷你存储";}s:7:"miniDoc";a:2:{s:4:"type";s:7:"miniDoc";s:4:"name";s:12:"迷你文档";}s:13:"businessTheme";a:2:{s:4:"type";s:13:"businessTheme";s:4:"name";s:15:"商业版主题";}i:0;b:0;}')

        var res = yield request(app)
            .post('/api/v1/files/get_store_server')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body.host.should.equal('http://192.168.0.11')
        done()
    })
    it(protocol + ' files/get_store_server 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_store_server')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' files/get_store_server 409', function*(done) {
        var MiniStorageNode = require('../../lib/model/store-node')
        var node1 = yield MiniStorageNode.create('store1', 'http://192.168.0.10', '1234')
        yield MiniStorageNode.setSaveCount(node1.name, 10)
        yield MiniStorageNode.setStatus(node1.name, false)
        var node2 = yield MiniStorageNode.create('store2', 'http://192.168.0.11', '1234')
        yield MiniStorageNode.setSaveCount(node2.name, 5)
        yield MiniStorageNode.setStatus(node2.name, false)
        var MiniOption = require('../../lib/model/option')
        yield MiniOption.create('active_plugins', 'a:6:{s:4:"cqdx";a:2:{s:4:"type";s:15:"thirdUserSource";s:4:"name";s:21:"重庆党校用户源";}s:10:"miniSearch";a:2:{s:4:"type";s:10:"miniSearch";s:4:"name";s:12:"迷你搜索";}s:9:"miniStore";a:2:{s:4:"type";s:9:"miniStore";s:4:"name";s:12:"迷你存储";}s:7:"miniDoc";a:2:{s:4:"type";s:7:"miniDoc";s:4:"name";s:12:"迷你文档";}s:13:"businessTheme";a:2:{s:4:"type";s:13:"businessTheme";s:4:"name";s:15:"商业版主题";}i:0;b:0;}')

        var res = yield request(app)
            .post('/api/v1/files/get_store_server')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(409)
            .end()
        res.body.error.should.equal('no_valid_minicloud_store_node')
        done()
    })
})