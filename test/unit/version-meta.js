var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' version-meta.js', function() {
    this.timeout(global.timeout)
    var app = null  
    before(function*(done) {
        app = yield context.getApp() 
        return done()
    })
    it(protocol + ' create', function*(done) {
        MiniVersionMeta = require('../../lib/model/version-meta') 
        yield MiniVersionMeta.create(1,'abc','11')
        yield MiniVersionMeta.create(1,'abc','12') 
        done()
    })       
})
