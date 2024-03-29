var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' groups/add', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniGroup = null
    before(function*(done) {

        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniGroup = require('../../lib/model/group')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
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

    it(protocol + ' groups/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'development'
            })
            .expect(200)
            .end()
        var groupList = yield MiniGroup.getAllByUserId(user.id)
        groupList[0].name.should.equal('development')
        done()
    })
    it(protocol + ' groups/add 200 normalize name', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'devel/opment'
            })
            .expect(200)
            .end()
        var existed = 0
        var groupList = yield MiniGroup.getAllByUserId(user.id)
        for (var i = 0; i < groupList.length; i++) {
            var group = groupList[i] 
            if (group.name === 'devel-opment') {
                existed = 1
            }
        }
        assert.equal(existed, 1)
        done()
    })
    it(protocol + ' groups/add socket.io  200', function*(done) {
        global.socket.emit('/api/v1/groups/add', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                name: 'development'
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var groupList = yield MiniGroup.getAllByUserId(user.id)
                groupList[0].name.should.equal('development')
                done()
            })()
        })
    })
    it(protocol + ' groups/add 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                name: 'development'
            })
            .expect(401)
            .end()
        done()
    })

    it(protocol + ' groups/add 409 group_existed', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'development'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('group_existed')
        done()
    })
    it(protocol + ' groups/add 400 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
})
