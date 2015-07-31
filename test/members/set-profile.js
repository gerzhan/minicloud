var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' set profile', function() {
    var app = null
    var accessToken = null
    before(function*(done) {
        app = yield context.getApp()
        var modelApp = require("../../lib/model/app")
        var modelUser = require("../../lib/model/user")
        var modelUserMeta = require("../../lib/model/user-meta")
        yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        var user = yield modelUser.create("water", "water")

        yield modelUserMeta.create(user.id, 'nick', "smallwa")
        yield modelUserMeta.create(user.id, 'avatar', "/images/default_avatar.png")
        yield modelUserMeta.create(user.id, 'email', "smallwa@miniyun.cn")
        yield modelUserMeta.create(user.id, 'space', 1048570)
        yield modelUserMeta.create(user.id, 'used_space', 10249)

        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'water',
                password: 'water',
                device_name: 'ji1111m-pc-windows7',
                app_key: 'JsQCsjF3yr7KACyT',
                app_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()

        res.should.have.header('Content-Type', 'application/json; charset=utf-8')
        res.body.token_type.should.equal('bearer')
        accessToken = res.body.access_token

        return done()

    })
    it(protocol + ' should return 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/set_profile')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                metas: {
                    nick: 'smallwater',
                    avatar: '/images/123.png',
                    email: 'water@miniyun.cn'
                }
            })
            .expect(200)
            .end()
        done()

    })
    it(protocol + ' should return 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/set_profile')
            .type('json')
            .set({
                Authorization: 'Bearer 123'
            })
            .send({
                metas: {
                    nick: 'smallwater',
                    avatar: '/images/123.png',
                    email: 'water@miniyun.cn'
                }
            })
            .expect(401)
            .end()
        done()

    })
})
