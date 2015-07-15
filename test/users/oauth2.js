var assert = require("assert")
var request = require("supertest")
var co = require('co')
var context = require("../context")
describe('Users', function() {
    describe('oauth2/token', function() {
        it('should return token', function(done) {
            co.wrap(function*() {
                var app = yield context.getApp()
                request(app)
                    .post('/api/v1/oauth2/token')
                    .type('json')
                    .timeout(10000)
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
                        done()
                    })
            })()
        })
    });
})
