var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' members', function() {
    var app = null
    var accessToken = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var modelApp = require("../../lib/model/app")
        var modelUser = require("../../lib/model/user")
        var modelUserMeta = require("../../lib/model/user-meta")
        yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        var user = yield modelUser.create("admin", "admin")
        yield modelUserMeta.create(user.id, 'email', 'app@miniyun.cn')
        yield modelUserMeta.create(user.id, 'nick', 'jim')
        yield modelUserMeta.create(user.id, 'phone', '+864000250057')
        yield modelUserMeta.create(user.id, 'total_space', '1073741824')
        yield modelUserMeta.create(user.id, 'is_admin', '1')

        var user = yield modelUser.create("lee", "lee")
        yield modelUserMeta.create(user.id, 'email', 'lee@miniyun.cn')
        yield modelUserMeta.create(user.id, 'nick', 'lee')
        yield modelUserMeta.create(user.id, 'phone', '+868655201')
        yield modelUserMeta.create(user.id, 'total_space', '1073741824')
        yield modelUserMeta.create(user.id, 'is_admin', '0')
        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'admin',
                password: 'admin',
                device_name: 'ji1111m-pc-windows7',
                app_key: 'JsQCsjF3yr7KACyT',
                app_secret: 'bqGeM4Yrjs3tncJZ'
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
        //TODO Each element should determine the list
        res.body[0].name.should.equal('lee')
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
                key:"lee"
            })
            .expect(200)
            .end()
            res.body[0].name.should.equal('lee')
        //TODO Each element should determine the list
        done()
    })
})
