var request = require("co-supertest")
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' oauth2', function() {
     this.timeout(10000)
    var app = null
        //before hook start app server,initialize data
    before(function*(done) {
        app = yield context.getApp()
            //ready data
        var MiniApp = require("../../lib/model/app")
        var MiniUser = require("../../lib/model/user")
        yield MiniApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
        yield MiniUser.create("admin", "admin")
        return done()
    })

    describe(protocol + ' oauth2/token', function() {
        it('should return token', function*(done) {
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
            res.should.have.header('Content-Type', 'application/json; charset=utf-8')
            res.body.token_type.should.equal('bearer')
            done()
        })
        it(protocol + ' should return 401,user not existed or disabled', function*(done) {
            var res = yield request(app)
                .post('/api/v1/oauth2/token')
                .type('json')
                .send({
                    name: 'admin1',
                    password: 'admin',
                    device_name: 'ji1111m-pc-windows7',
                    client_id: 'JsQCsjF3yr7KACyT',
                    client_secret: 'bqGeM4Yrjs3tncJZ'
                })
                .expect(401)
                .end()
            res.body.error_description.should.equal('user not exist or disable')
            done()
        })
        it(protocol + ' should return 401,incorrect password', function*(done) {
            var res = yield request(app)
                .post('/api/v1/oauth2/token')
                .type('json')
                .send({
                    name: 'admin',
                    password: 'admin1',
                    device_name: 'ji1111m-pc-windows7',
                    client_id: 'JsQCsjF3yr7KACyT',
                    client_secret: 'bqGeM4Yrjs3tncJZ'
                })
                .expect(401)
                .end()
            res.body.error_description.should.equal('incorrect password')
            done()
        })
        it(protocol + ' should return 409,lock user', function*(done) {
            //ready data
            var MiniUserMeta = require("../../lib/model/user-meta")
            var meta = yield MiniUserMeta.create(1, "password_error_count", "6")
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
                .expect(401)
                .end()
            res.body.error_description.should.equal('user is locked,enter the wrong password over five times.please try again after 15 minutes')
            var MiniUserMeta = require("../../lib/model/user-meta")
            yield MiniUserMeta.create(1, "password_error_count", "0")
            done()
        })
    })
})
