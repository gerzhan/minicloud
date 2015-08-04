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
        var MiniApp = require("../../lib/model/app")
        var MiniUser = require("../../lib/model/user")
        yield MiniApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        yield MiniUser.create("admin", "admin")
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
    it('should get user login logs', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/get_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var userIp = res.body.events[0].ip
        userIp.should.equal('::ffff:127.0.0.1')
        done()
    })
    it("should clean user's all login logs", function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/clean_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
            var eventModel = dbPool.eventModel
            var result =  yield eventModel.find({user_id: 1,type: 1}).coRun()
            result.length.should.equal(0)
        done()
    })
    it(protocol + ' should return 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/get_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
})
