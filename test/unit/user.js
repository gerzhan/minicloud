var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' user.js', function() {
    this.timeout(global.timeout)
    var app = null 
    var MiniUser = null 
    before(function*(done) {
        app = yield context.getApp()
        MiniUser = require('../../lib/model/user') 
        return done()
    })
    it(protocol + ' getById', function*(done) {
        var user = yield MiniUser.getById(1234)
        assert.equal(user,null)
        done()
    })    
    it(protocol + ' create', function*(done) {
        var user1 = yield MiniUser.create('admin','1234')
        var user2 = yield MiniUser.create('admin','2345')
        assert.equal(user2.id,user2.id)
        done()
    })  
    it(protocol + ' remove', function*(done) {
        var user1 = yield MiniUser.create('admin','1234')
        yield MiniUser.remove('admin')
        var user2 = yield MiniUser.getByName('admin')
        assert.equal(user2,null)
        done()
    })
})
