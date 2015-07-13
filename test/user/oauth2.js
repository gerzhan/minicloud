var assert = require("assert")
var co = require("co")
var request = require("co-request")
var host = "http://127.0.0.1:8030"
describe('Users', function() {
    describe('oauth2/token', function() {
        it('should return token', function(done) {
            var options = {
                url: host + "/api/v1/oauth2/token",
                headers: {
                    'Content-Type': 'application/json'
                },
                method:"POST",
                body: {
                    name: 'admin',
                    password: 'admin',
                    device_name: 'jim-pc-windows7',
                    app_key: 'JsQCsjF3yr7KACyT',
                    app_secret: 'bqGeM4Yrjs3tncJZ'
                },
                json:true
            } 
            co.wrap(function* () { 
                var postResponse = yield request(options)
  				var body = postResponse.body
  				var type = body.token_type 
  				assert.equal("bearer",type)  
                done()
            })()
            
        })
    });
})
