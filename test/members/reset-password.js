var request = require("co-supertest")
var context = require("../context")
var helpers = require("../../lib/helpers")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' reset password', function() {
    var app = null
    var accessToken = null
    var userModel = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        var appModel = require("../../lib/model/app")
        userModel = require("../../lib/model/user")
        yield appModel.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        user = yield userModel.create("Tomtom", "tomtom")

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
        var userObj = yield userModel.getById(user.id)
        var salt = userObj.salt
        var password = userObj.password
        var ciphertext = helpers.encryptionPasswd('ttoomm', salt)
        ciphertext.should.equal(password)
           
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
