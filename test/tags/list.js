var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' tags/list', function() {
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
        yield MiniTag.create(user.id, 'green')
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

it(protocol + ' tags/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body[0].name.should.equal('green')
        done()
    })
 it(protocol + ' tags/list socket.io  200', function*(done) {
        global.socket.emit('/api/v1/tags/list', {
            header: {
                Authorization: 'Bearer ' + accessToken
            }
        }, function(body) {
           body[0].name.should.equal('green')
            done()
        })
    })
 it(protocol + ' tags/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/list')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })

})