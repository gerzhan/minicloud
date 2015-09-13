var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' event/list', function() {
    this.timeout(global.timeout)
    var app = null
    var accessToken = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        var MiniEvent = require('../../lib/model/event')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin', 9)
        var device = yield MiniDevice.create(user, 'chrome', 'JsQCsjF3yr7KACyT')
        var device2 = yield MiniDevice.create(user, 'IE', 'JsQCsjF3yr7KACyT')
        yield MiniEvent.createLoginEvent('192.168.0.101',device)
        yield MiniEvent.createLogoutEvent('192.168.0.101',device)
        yield MiniEvent.createLoginEvent('192.168.0.101',device2)
        yield MiniEvent.createLogoutEvent('192.168.0.101',device2)
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
    it(protocol + ' events/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/list')
            .type('json')
            .send({
                before_created_at: '',
                cursor: '',
                limit: 2,
                type: 'login'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        cursor = body.cursor
        body.has_more.should.equal(true)
        body.events[0].device_name.should.equal('ji1111m-pc-windows7')
        body.events[1].device_name.should.equal('IE')

        var res = yield request(app)
            .post('/api/v1/events/list')
            .type('json')
            .send({
                before_created_at: '',
                cursor: cursor,
                limit: 2,
                type: 'login'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.has_more.should.equal(true)
        body.events[0].device_name.should.equal('IE')
        done()
    })
    it(protocol + ' events/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/list')
            .type('json')
            .send({
                before_created_at: '',
                cursor: '',
                type: 'all'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        cursor = body.cursor
        body.has_more.should.equal(false)
        body.events[0].device_name.should.equal('ji1111m-pc-windows7')
        body.events[1].device_name.should.equal('IE')
        done()
    })
    it(protocol + ' events/list 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/list')
            .type('json')
            .send({
                before_created_at: '',
                cursor: '',
                type: 'not all'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' events/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/list')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .expect(401)
            .end()
        done()
    })
})
