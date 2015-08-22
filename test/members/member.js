var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' members', function() {
    this.timeout(15000)
    var app = null
    var accessToken = null
    var user1 = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user1 = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user1.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user1.id, 'nick', 'jim')
        yield MiniUserMeta.create(user1.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user1.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user1.id, 'is_admin', '1')

        var user = yield MiniUser.create('jim', 'jim')
        yield MiniUserMeta.create(user.id, 'email', 'jim@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'lee')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user.id, 'is_admin', '0')

        var user = yield MiniUser.create('tom', 'tom')
        yield MiniUserMeta.create(user.id, 'email', 'tom@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'tom')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user.id, 'is_admin', '0')

        var user = yield MiniUser.create('good', 'tom')
        yield MiniUserMeta.create(user.id, 'email', 'good@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', '张三')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user.id, 'is_admin', '0')

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

    it(protocol + ' members/get_my_account 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/get_my_account')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body.name.should.equal('admin')
        done()
    })
    it(protocol + ' members/get_my_account 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/get_my_account')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' members/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.has_more.should.equal(false)
        body.cursor.should.equal('')
        body.members.length.should.equal(4)
        body.members[0].name.should.equal('admin')
        body.members[1].name.should.equal('jim')
        body.members[2].name.should.equal('tom')
        body.members[3].name.should.equal('good')
        done()
    })
    it(protocol + ' members/list 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/list')
            .type('json')
            .send({
                limit: 'abc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' members/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/list')
            .type('json')
            .set({
                Authorization: 'Bearer 1111'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' members/search 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/search')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                key: 'z'
            })
            .expect(200)
            .end()
        var body = res.body
        body.has_more.should.equal(false)
        body.cursor.should.equal('')
        body.members.length.should.equal(1)
        body.members[0].name.should.equal('good')
        done()
    })
    it(protocol + ' members/search 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/search')
            .type('json')
            .send({
                limit: 'abc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' members/search 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/search')
            .type('json')
            .set({
                Authorization: 'Bearer 1111'
            })
            .send({
                key: 'z'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' members/search 401', function*(done) {
        var MiniDevice = require('../../lib/model/device')
        var devices = yield MiniDevice.getAllByUserId(user1.id)
        var device = devices[0]
        yield device.destroy()
        var res = yield request(app)
            .post('/api/v1/members/search')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                key: 'z'
            })
            .expect(401)
            .end()
        done()
    })
})
