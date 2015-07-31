var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
var php = require('phpjs')
describe(protocol + ' event', function() {
    var app = null
    var accessToken = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var modelApp = require("../../lib/model/app")
        var modelUser = require("../../lib/model/user")
        yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        yield modelUser.create("admin", "admin")
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
        res.should.have.header('Content-Type', 'application/json; charset=utf-8')
        res.body.token_type.should.equal('bearer')
            //set access_token
        accessToken = res.body.access_token
        return done()
    })
    it('should get user login logs', function*(done) {
        var res = yield request(app)
            .post('/api/v1/event/get_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var userIp = php.unserialize(res.body[0].context).ip
            //todo
        userIp.should.equal('::ffff:127.0.0.1')
        done()
    })
    it("should clean user's all login logs", function*(done) {
        var res = yield request(app)
            .post('/api/v1/event/clean_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        done()
    })
    it(protocol + ' should return 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/event/get_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
})
