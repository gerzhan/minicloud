var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' set profile', function() {
    this.timeout(10000)
    var app = null
    var accessToken = null
    var MiniUserMeta = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('water', 'water')

        yield MiniUserMeta.create(user.id, 'nick', 'smallwa')
        yield MiniUserMeta.create(user.id, 'avatar', '/images/default_avatar.png')
        yield MiniUserMeta.create(user.id, 'email', 'smallwa@minicloud.io')
        yield MiniUserMeta.create(user.id, 'space', 1048570)
        yield MiniUserMeta.create(user.id, 'used_space', 10249)

        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'water',
                password: 'water',
                device_name: 'ji1111m-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
        accessToken = res.body.access_token
        return done()
    })
    it(protocol + ' members/set_profile 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/set_profile')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                nick: 'smallwater',
                avatar: '/images/123.png',
                email: 'water@minicloud.io'
            })
            .expect(200)
            .end()
        var metaList = yield MiniUserMeta.getAll(user.id)
        metaList[0].value.should.equal('smallwater')
        metaList[1].value.should.equal('/images/123.png')
        metaList[2].value.should.equal('water@minicloud.io')
        done()
    }) 
    it(protocol + ' members/set_profile 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/set_profile')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                nick: 'smallwater',
                avatar: '/images/123.png',
                email: 'waterminicloud.io'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' members/set_profile 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/set_profile')
            .type('json')
            .set({
                Authorization: 'Bearer 123'
            })
            .send({
                nick: 'smallwater',
                avatar: '/images/123.png',
                email: 'water@minicloud.io'
            })
            .expect(401)
            .end()
        done()
    })
})
