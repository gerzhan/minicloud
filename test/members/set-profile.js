var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' set profile', function() {
    var app = null
    var accessToken = null
    var userMetaModel = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        var appModel = require("../../lib/model/app")
        var userModel = require("../../lib/model/user")
        userMetaModel = require("../../lib/model/user-meta")
        yield appModel.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        user = yield userModel.create("water", "water")

        yield userMetaModel.create(user.id, 'nick', "smallwa")
        yield userMetaModel.create(user.id, 'avatar', "/images/default_avatar.png")
        yield userMetaModel.create(user.id, 'email', "smallwa@miniyun.cn")
        yield userMetaModel.create(user.id, 'space', 1048570)
        yield userMetaModel.create(user.id, 'used_space', 10249)

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
                nick: 'smallwater',
                avatar: '/images/123.png',
                email: 'water@miniyun.cn'
            })
            .expect(200)
            .end()
        var metaList = yield userMetaModel.getAll(user.id)
        metaList[0].value.should.equal('smallwater')
        metaList[1].value.should.equal('/images/123.png')
        metaList[2].value.should.equal('water@miniyun.cn')
           
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
                nick: 'smallwater',
                avatar: '/images/123.png',
                email: 'water@miniyun.cn'
            })
            .expect(401)
            .end()
        done()

    })
})
