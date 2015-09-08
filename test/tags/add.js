var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' tags/add', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var user = null
    var MiniTag = null
    before(function*(done) {

        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
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
    it(protocol + ' tags/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'g,reen'
            })
            .expect(200)
            .end()
        var tagList = yield MiniTag.getAllByUserId(user.id)
        tagList[0].name.should.equal('g_reen')
        done()
    })
    it(protocol + ' tags/add socket.io  200', function*(done) {
        global.socket.emit('/api/v1/tags/add', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                name: 'green'
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var tagList = yield MiniTag.getAllByUserId(user.id)
                tagList[1].name.should.equal('green')
                done()
            })()
        })
    })
    it(protocol + ' tags/add 400 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' tags/add 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/add')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                name: 'green'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' tags/add 409 tag_existed', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'green'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('tag_existed')
        done()
    })

})
