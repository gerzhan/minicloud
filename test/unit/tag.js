var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' tag.js', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    before(function*(done) {
        app = yield context.getApp()
        MiniTag = require('../../lib/model/tag')
        return done()
    })
    it(protocol + ' rename', function*(done) {
        var success = yield MiniTag.rename(1, 'greennnn', 'green')
        assert.equal(success, false)
        done()
    })
    it(protocol + ' getByTagId', function*(done) {
        var tag = yield MiniTag.getByTagId(1, 3000)
        assert.equal(tag,null)
        done()
    })
})
