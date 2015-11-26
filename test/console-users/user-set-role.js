var request = require('co-supertest')
var context = require('../context')
var should = require('should')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' user-set-role', function() {
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


    it(protocol + ' console/users/set_role 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .send({})
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' console/users/set_role 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer 1111'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' console/users/set_role 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/set_role')
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
    it(protocol + ' console/users/set_role 200', function*(done) {
        var MiniUser = require('../../lib/model/user')
            //common_user
        var res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user1.uuid,
                role: 'common_user'
            })
            .expect(200)
            .end()
            //check user
        var newUser = yield MiniUser.getByName(user1.name)
        newUser.role.should.equal(COMMON_USER)
            //sub_admin
        res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user1.uuid,
                role: 'sub_admin'
            })
            .expect(200)
            .end()
            //check user
        newUser = yield MiniUser.getByName(user1.name)
        newUser.role.should.equal(SUB_ADMIN)
            //SUPER_ADMIN
        res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user1.uuid,
                role: 'super_admin'
            })
            .expect(200)
            .end()
            //check user
        newUser = yield MiniUser.getByName(user1.name)
        newUser.role.should.equal(SUPER_ADMIN)
            //IT_ADMIN
        res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user1.uuid,
                role: 'it_admin'
            })
            .expect(200)
            .end()
            //check user
        newUser = yield MiniUser.getByName(user1.name)
        newUser.role.should.equal(IT_ADMIN)
        done()
    })
    it(protocol + ' console/users/set_role 200 last super admin', function*(done) {
        var MiniUser = require('../../lib/model/user')
            //common_user
        var res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user.uuid,
                role: 'common_user'
            })
            .expect(200)
            .end()
            //check user
        var newUser = yield MiniUser.getByName(user.name)
        newUser.role.should.equal(SUPER_ADMIN)
            //sub_admin
        res = yield request(app)
            .post('/api/v1/console/users/set_role')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                uuid: user.uuid,
                role: 'sub_admin'
            })
            .expect(200)
            .end()
            //check user
        newUser = yield MiniUser.getByName(user.name)
        newUser.role.should.equal(SUPER_ADMIN)
        done()
    })
})
