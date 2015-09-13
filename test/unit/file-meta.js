var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file-meta.js', function() {
    this.timeout(global.timeout) 
    var app = null
    var MiniFileMeta = null
    before(function*(done) {
        app = yield context.getApp()
        MiniFileMeta = require('../../lib/model/file-meta')
        return done()
    })
    it(protocol + ' create', function*(done) {
        var MiniUser = require('../../lib/model/user')
        var user = yield MiniUser.create('admin', 'admin')
        
        var file = {
            path_lower: '/1/home/a.doc'
        }
        var device = {
            id: 1,
            name: 'jim\'s phone',
            client_id: 'xxxxx',
            user_id: user.id
        }
        var version1 = {
            hash: 'X12345'
        }
        var version2 = {
            hash: 'X12344'
        }
        var meta1 = yield MiniFileMeta.addRev(file, version1, device)
        var meta2 = yield MiniFileMeta.addRev(file, version2, device)
        var revs = yield MiniFileMeta.getRevs('/1/home/a.doc')  
        assert(revs.length, 2)
        assert(revs[0].hash, 'X12344')
        assert(revs[1].hash, 'X12345')
        done()
    })
})
