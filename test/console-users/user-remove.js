var request = require('co-supertest')
var context = require('../context')
var should = require('should')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' users-remove', function() {
    this.timeout(global.timeout)
    var app = null
    var accessToken = null
    var user = null
    var device = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin', SUPER_ADMIN)
        yield MiniUserMeta.create(user.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'admin')
        yield MiniUserMeta.create(user.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

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


    it(protocol + ' console/users/remove 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/remove')
            .type('json')
            .send({})
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' console/users/remove 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer 1111'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' console/users/remove 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: '1111'
            })
            .expect(409)
            .end()
        done()
    })
    it(protocol + ' console/users/remove 200', function*(done) {
        var MiniUserDevice = require('../../lib/model/device')
        var MiniUserMeta = require('../../lib/model/user-meta')
        var MiniEvent = require('../../lib/model/event')
        var MiniVersion = require('../../lib/model/version')
        var MiniFile = require('../../lib/model/file')
        var MiniGroup = require('../../lib/model/group')
        var MiniTag = require('../../lib/model/tag')
        var MiniUser = require('../../lib/model/user')
            //create event
        yield MiniEvent.createLogoutEvent('127.0.0.1', device)
        yield MiniEvent.createLogoutEvent('127.0.0.1', device)
            //create file
        var version = yield MiniVersion.create('X1234567', 1073741825)
        yield MiniFile.createFile(device, '/Image/123/1.doc', version, null)
        yield MiniFile.createFile(device, '/Image/123/2.doc', version, null)
            //create group
        yield MiniGroup.create(user.id, 'g1')
        yield MiniGroup.create(user.id, 'g2')
            //create tag
        yield MiniTag.create(user.id, 'g1')
        yield MiniTag.create(user.id, 'g2')
        var res = yield request(app)
            .post('/api/v1/console/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user.uuid
            })
            .expect(200)
            .end()
            //check user
        var user1 = yield MiniUser.getByName(user.name)
        should(user1).not.be.ok()
            //check devices
        var devices = yield MiniUserDevice.getAllByUserId(user.id)
        devices.length.should.equal(0)
            //check metas
        var metas = yield MiniUserMeta.getAll(user.id)
        metas.length.should.equal(0)
            //check files
        var files = yield MiniFile.getAllByUserId(user.id)
        files.length.should.equal(0)
            //check events
        var events = yield MiniEvent.getAllByUserId(user.id)
        events.length.should.equal(0)
            //check group
        var groups = yield MiniGroup.getAllByUserId(user.id)
        groups.length.should.equal(0)
            //check tag
        var tags = yield MiniTag.getAllByUserId(user.id)
        tags.length.should.equal(0)
        done()
    })
})
