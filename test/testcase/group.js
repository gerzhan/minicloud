var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' group.js', function() {
    this.timeout(10000)
    var app = null 
    var MiniUser = null 
    before(function*(done) {
        app = yield context.getApp()
        MiniGroup = require('../../lib/model/group') 
        return done()
    })
    it(protocol + ' rename', function*(done) {
        var success = yield MiniGroup.rename(1,'group','groupss')
        assert.equal(success,false)
        done()
    }) 
})