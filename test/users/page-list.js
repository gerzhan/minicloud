var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' users', function() {
    this.timeout(global.timeout)
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
        user1 = yield MiniUser.create('admin', 'admin', SUPER_ADMIN)
        yield MiniUserMeta.create(user1.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user1.id, 'nick', 'admin')
        yield MiniUserMeta.create(user1.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user1.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user1.id, 'is_admin', '1')

        var user = yield MiniUser.create('jim1', 'jim1', SUPER_ADMIN)
        yield MiniUserMeta.create(user.id, 'email', 'jim1@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', '张三')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUser.setStatus(user, 0)

        var user = yield MiniUser.create('jim2', 'jim2')
        yield MiniUserMeta.create(user.id, 'email', 'jim2@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim2')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUser.setStatus(user, 0)

        var user = yield MiniUser.create('jim3', 'jim3')
        yield MiniUserMeta.create(user.id, 'email', 'jim3@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim3')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

        var user = yield MiniUser.create('jim4', 'jim4')
        yield MiniUserMeta.create(user.id, 'email', 'jim4@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim4')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

        var user = yield MiniUser.create('jim5', 'jim5')
        yield MiniUserMeta.create(user.id, 'email', 'jim5@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim5')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

        var user = yield MiniUser.create('jim6', 'jim6')
        yield MiniUserMeta.create(user.id, 'email', 'jim6@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim6')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')


        var user = yield MiniUser.create('jim7', 'jim7')
        yield MiniUserMeta.create(user.id, 'email', 'jim7@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim7')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

        var user = yield MiniUser.create('jim8', 'jim8')
        yield MiniUserMeta.create(user.id, 'email', 'jim8@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim8')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

        var user = yield MiniUser.create('jim9', 'jim9')
        yield MiniUserMeta.create(user.id, 'email', 'jim9@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim9')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')


        var user = yield MiniUser.create('jim10', 'jim10')
        yield MiniUserMeta.create(user.id, 'email', 'jim10@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim10')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')


        var user = yield MiniUser.create('jim11', 'jim11')
        yield MiniUserMeta.create(user.id, 'email', 'jim11@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim11')
        yield MiniUserMeta.create(user.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

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


    it(protocol + ' users/page_list 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/page_list')
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
    it(protocol + ' users/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/list')
            .type('json')
            .set({
                Authorization: 'Bearer 1111'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' users/page_list 200 filter:disabled', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/page_list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                // search_key:'a',
                page: 0,
                limit: 2,
                filter: 'disabled',
                order: {
                    name: true
                }
            })
            .expect(200)
            .end()
        var body = res.body  
        body.users.length.should.equal(2)
        body.users[0].name.should.equal('jim1')
        body.users[1].name.should.equal('jim2')

        done()
    })
    it(protocol + ' users/page_list 200 filter:admin', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/page_list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                // search_key:'a',
                page: 0,
                limit: 2,
                filter: 'admin',
                order: {
                    name: true
                }
            })
            .expect(200)
            .end()
        var body = res.body  
        body.users.length.should.equal(2)
        body.users[0].name.should.equal('admin') 
        body.users[1].name.should.equal('jim1') 
        done()
    })
    it(protocol + ' users/page_list 200 page', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/page_list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                // search_key:'a',
                page: 1,
                limit: 2
            })
            .expect(200)
            .end()
        var body = res.body  
        body.users.length.should.equal(2)
        body.users[0].name.should.equal('jim9') 
        body.users[1].name.should.equal('jim8') 
        done()
    })
    it(protocol + ' users/page_list 200 search_key', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/page_list')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                search_key:'zs',
                page: 0,
                limit: 2
            })
            .expect(200)
            .end()
        var body = res.body  
        body.users.length.should.equal(1)
        body.users[0].name.should.equal('jim1')  
        done()
    })
})
