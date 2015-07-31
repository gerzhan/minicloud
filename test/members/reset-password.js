var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' reset password', function() {
    var app = null
    var accessToken = null
    before(function*(done) {
        app = yield context.getApp()
        var modelApp = require("../../lib/model/app")
        var modelUser = require("../../lib/model/user")
        yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        yield modelUser.create("Tomtom", "tomtom")

        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'Tomtom',
                password: 'tomtom',
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
    it(protocol + ' should reset password', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/reset_password')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_password: 'tomtom',
                new_password: 'ttoomm'
            })
            .expect(200)
            .end()
        done()

    })
    it(protocol + ' should return 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/reset_password')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                old_password: 'tomtom',
                new_password: 'ttoomm'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' should return 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/reset_password')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_password: 'aaaaaa',
                new_password: 'ttoomm'
            })
            .expect(409)
            .end()
        done()

    })
})
