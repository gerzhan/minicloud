var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/get_storage_server', function() {
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
        var MiniStorageNode = require('../../lib/model/storage-node') 
        var node1 = yield MiniStorageNode.create('store1','http://192.168.0.10','1234')
        yield MiniStorageNode.setStatus(node1.name,true)
        var node2 = yield MiniStorageNode.create('store2','http://192.168.0.11','1234')
        yield MiniStorageNode.setStatus(node1.name,true) 
        var MiniOption = require('../../lib/model/option') 
        yield MiniOption.create('active_plugins','a:6:{s:4:"cqdx";a:2:{s:4:"type";s:15:"thirdUserSource";s:4:"name";s:21:"重庆党校用户源";}s:10:"miniSearch";a:2:{s:4:"type";s:10:"miniSearch";s:4:"name";s:12:"迷你搜索";}s:9:"miniStore";a:2:{s:4:"type";s:9:"miniStore";s:4:"name";s:12:"迷你存储";}s:7:"miniDoc";a:2:{s:4:"type";s:7:"miniDoc";s:4:"name";s:12:"迷你文档";}s:13:"businessTheme";a:2:{s:4:"type";s:13:"businessTheme";s:4:"name";s:15:"商业版主题";}i:0;b:0;}')
        
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
    it(protocol + ' files/get_storage_server 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/get_storage_server')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end() 
        done()
    })
})
