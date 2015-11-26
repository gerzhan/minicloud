var request = require('co-supertest')
var context = require('../context')
var should = require('should')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' user-set-status', function() {
    this.timeout(global.timeout)
    var app = null
    var accessToken = null
    var user = null
    var user1 = null
    var device = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin', SUPER_ADMIN)
        user1 = yield MiniUser.create('jim', 'jim', COMMON_USER)

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


    it(protocol + ' console/users/set_status 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/set_status')
            .type('json')
            .send({})
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' console/users/set_status 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/set_status')
            .type('json')
            .set({
                Authorization: 'Bearer 1111'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' console/users/set_status 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/set_status')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: '1111'
            })
            .expect(409)
            .end()
        done()
    })
    it(protocol + ' console/users/set_status 200', function*(done) {
        var MiniUser = require('../../lib/model/user')
            //disabled
        var res = yield request(app)
            .post('/api/v1/console/users/set_status')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user1.uuid,
                enable: false
            })
            .expect(200)
            .end()
            //check user
        var newUser = yield MiniUser.getByName(user1.name) 
        newUser.status.should.equal(0)
            //enabled
        res = yield request(app)
            .post('/api/v1/console/users/set_status')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user1.uuid,
                enable: true
            })
            .expect(200)
            .end()
            //check user
        newUser = yield MiniUser.getByName(user1.name) 
        newUser.status.should.equal(1)
        done()
    })
})
