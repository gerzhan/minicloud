var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file-tag-relation.js', function() {
    this.timeout(global.timeout) 
    var app = null 
    var MiniFileTagRelation = null 
    before(function*(done) {
        app = yield context.getApp()
        MiniFileTagRelation = require('../../lib/model/file-tag-relation')  
        return done()
    })
    it(protocol + ' create', function*(done) {
        var relaton1 = yield MiniFileTagRelation.create(1,1)
        var relaton2 = yield MiniFileTagRelation.create(1,1) 
        assert.equal(relaton1.id,relaton2.id)
        done()
    })      
})