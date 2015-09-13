var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' user-group-relation.js', function() {
    this.timeout(global.timeout)
    var app = null 
    var MiniUserGroupRelation = null 
    before(function*(done) {
        app = yield context.getApp()
        MiniUserGroupRelation = require('../../lib/model/user-group-relation')  
        return done()
    })
    it(protocol + ' create', function*(done) {
        var relaton1 = yield MiniUserGroupRelation.create(1,1)
        var relaton2 = yield MiniUserGroupRelation.create(1,1) 
        assert.equal(relaton1.id,relaton2.id)
        done()
    })      
})
