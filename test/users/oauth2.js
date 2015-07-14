var assert = require("assert")
var request = require("co-request")
describe('Users', function() {
    describe('oauth2/token', function() {
        it('should return token', function(done) {
            var co = require('co')
            co.wrap(function*() {
                var config = require("../config-test.json")
                var server = yield require("../../lib/loader/server-loader")(config)
                // request(server.listen(8033))
                //     .post('/api/v1/oauth2/token')
                //     .type('json')
                //     .send({
                //         name: 'admin',
                //         password: 'admin',
                //         device_name: 'ji1111m-pc-windows7',
                //         app_key: 'JsQCsjF3yr7KACyT',
                //         app_secret: 'bqGeM4Yrjs3tncJZ'
                //     })
                //     .end(function(err,res) {
                //         console.log(res.body)
                //     })
                server.listen(8044)
                var host = "http://127.0.0.1:8044"
                var options = {
                    url: host + "/api/v1/oauth2/token",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method:"POST",
                    body: {
                        name: 'admin',
                        password: 'admin',
                        device_name: 'ji1111m-pc-windows7',
                        app_key: 'JsQCsjF3yr7KACyT',
                        app_secret: 'bqGeM4Yrjs3tncJZ'
                    },
                    json:true
                } 
                var postResponse = yield request(options) 
                var body = postResponse.body 
                var type = body.token_type 
                assert.equal("bearer",type)  
                done()
            })()
        })
    });
})
