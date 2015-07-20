var assert = require("assert")
var request = require("supertest")
var co = require('co')
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL
describe(protocol+' Users', function() {
    var app = null
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
            return done()
        })()
    })

    describe(protocol+' oauth2/token', function() {
        // it('should return token', function(done) {
        //     request(app)
        //         .post('/api/v1/oauth2/token')
        //         .type('json')
        //         .send({
        //             name: 'admin',
        //             password: 'admin',
        //             device_name: 'ji1111m-pc-windows7',
        //             app_key: 'JsQCsjF3yr7KACyT',
        //             app_secret: 'bqGeM4Yrjs3tncJZ'
        //         })
        //         .expect(200)
        //         .end(function(err, res) {
        //             if (err) return done(err)
        //             res.should.have.header('Content-Type', 'application/json; charset=utf-8')
        //             res.body.token_type.should.equal('bearer')
        //             done()
        //         })
        // })
        // it(protocol+' should return 401,user not existed or disabled', function(done) {
        //     request(app)
        //         .post('/api/v1/oauth2/token')
        //         .type('json')
        //         .send({
        //             name: 'admin1',
        //             password: 'admin',
        //             device_name: 'ji1111m-pc-windows7',
        //             app_key: 'JsQCsjF3yr7KACyT',
        //             app_secret: 'bqGeM4Yrjs3tncJZ'
        //         })
        //         .expect(401)
        //         .end(function(err, res) {
        //             if (err) return done(err)
        //             res.body.error_description.should.equal('user not existed or disabled')
        //             done()
        //         })
        // })
        // it(protocol+' should return 401,incorrect password', function(done) {
        //     request(app)
        //         .post('/api/v1/oauth2/token')
        //         .type('json')
        //         .send({
        //             name: 'admin',
        //             password: 'admin1',
        //             device_name: 'ji1111m-pc-windows7',
        //             app_key: 'JsQCsjF3yr7KACyT',
        //             app_secret: 'bqGeM4Yrjs3tncJZ'
        //         })
        //         .expect(401)
        //         .end(function(err, res) {
        //             if (err) return done(err)
        //             res.body.error_description.should.equal('incorrect password')
        //             done()
        //         })
        // })
        it(protocol+' should return 409,lock user', function(done) {
            //ready data
            co.wrap(function*() {
                var modelUserMeta = require("../../lib/model/user-meta") 
                var meta = yield modelUserMeta.create(1, "password_error_count", "6")
                console.log({'metavalue2222':meta.value})
            })()
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
                .expect(401)
                .end(function(err, res) {
                    if (err) return done(err)
                    res.body.error_description.should.equal('user is locked,enter the wrong password over five times.please try again after 15 minutes')
                    //reset data
                    co.wrap(function*() {
                        var modelUserMeta = require("../../lib/model/user-meta")
                        yield modelUserMeta.create(1, "password_error_count", "0")
                        done()
                    })()
                    
                })
        })
    })
})
