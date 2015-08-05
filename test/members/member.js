var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' members', function() {
    this.timeout(15000)
    var app = null
    var accessToken = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniUserMeta = require('../../lib/model/user-meta')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim')
        yield MiniUserMeta.create(user.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user.id, 'is_admin', '1')

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

    it(protocol + ' should get user details', function*(done) {
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
    it(protocol + ' should return 401', function*(done) {
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
    it(protocol + ' should get members list', function*(done) {
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
        body.members[1].name.should.equal('good')
        body.members[2].name.should.equal('jim') 
        body.members[3].name.should.equal('tom') 
        done()
    })
    it(protocol + ' should search a certain member', function*(done) {
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
})
