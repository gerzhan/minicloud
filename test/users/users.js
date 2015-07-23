var assert = require("assert")
var request = require("supertest")
var co = require('co')
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol + ' Users', function() {
    var app = null
    var accessToken = null
        //before hook start app server,initialize data
    before(function(done) {
        co.wrap(function*() {
            //start server
            app = yield context.getApp()
                //ready data
            var modelApp = require("../../lib/model/app")
            var modelUser = require("../../lib/model/user")
            yield modelApp.create(-1, "web client", "JsQCsjF3yr7KACyT", "bqGeM4Yrjs3tncJZ", "", 1, "web client")
            yield modelUser.create("admin", "admin")
            request(app)
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
                .end(function(err, res) {
                    if (err) return done(err)
                    res.should.have.header('Content-Type', 'application/json; charset=utf-8')
                    res.body.token_type.should.equal('bearer')
                        //set access_token
                    accessToken = res.body.access_token
                    return done()
                })
        })()
    })

    it(protocol + ' should get user details', function(done) {
        request(app)
            .post('/api/v1/users/get_current_account')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                res.body.name.should.equal('admin')
                done()
            })
    })
})
