var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' option.js', function() {
    this.timeout(10000)
    var app = null
    var MiniOption = null
    var MiniApp = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        MiniOption = require('../../lib/model/option')
        MiniApp = require('../../lib/model/app')
        return done()
    })
    it(protocol + ' create', function*(done) {
        var option = yield MiniOption.create('site_id', '123')
        var option1 = yield MiniOption.create('site_id', '234')
        var option2 = yield MiniOption.getByKey('site_id') 
        option2.value.should.equal('234')
        option2.id.should.equal(option.id)
        done()
    })    
    
})
