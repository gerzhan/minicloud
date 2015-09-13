var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' app.js', function() {
    this.timeout(global.timeout) 
    var app = null 
    var MiniApp = null 
    before(function*(done) {
        app = yield context.getApp() 
        MiniApp = require('../../lib/model/app')
        return done()
    }) 
    it(protocol + ' getApp', function*(done) {
        var app = yield MiniApp.getApp('1122')
        assert.equal(app,null)
        done()
    })
    it(protocol + ' create', function*(done) {
        var app = yield MiniApp.create(-1,'test app','client_id','client_secret','',true,'')
        var app1 = yield MiniApp.create(-1,'test12 app','client_id','client_secret','',false,'')
        app1.id.should.equal(app.id)
        done()
    })
    
})
