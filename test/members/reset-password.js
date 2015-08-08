var request = require('co-supertest')
var context = require('../context')
var helpers = require('../../lib/helpers')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' reset password', function() {
    this.timeout(10000)
    var app = null
    var accessToken = null
    var MiniUser = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('Tomtom', 'tomtom')
        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'Tomtom',
                password: 'tomtom',
                device_name: 'ji1111m-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
        accessToken = res.body.access_token
        return done()
    })
    it(protocol + ' members/reset_password 200', function*(done) {
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
        var userObj = yield MiniUser.getById(user.id)
        var salt = userObj.salt
        var password = userObj.password
        var ciphertext = helpers.encryptionPasswd('ttoomm', salt)
        ciphertext.should.equal(password)
        done()
    })
    it(protocol + ' members/reset_password 409 member_locked', function*(done) {
        //ready data
        var MiniUserMeta = require("../../lib/model/user-meta")
        yield MiniUserMeta.create(user.id, "password_error_count", "6")
        var res = yield request(app)
            .post('/api/v1/members/reset_password')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_password: 'ttoomm',
                new_password: 'ttoomm1'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('member_locked')
            //reset password status
        yield MiniUserMeta.create(user.id, "password_error_count", "0")

        done()
    })
    it(protocol + ' members/reset_password 401', function*(done) {
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
    it(protocol + ' members/reset_password 409 old_password_invalid', function*(done) {
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
        res.body.error.should.equal('old_password_invalid')
        done()
    })
})
