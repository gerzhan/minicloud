var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file-meta.js', function() {
    this.timeout(10000)
    var app = null
    var MiniFileMeta = null
    before(function*(done) {
        app = yield context.getApp()
        MiniFileMeta = require('../../lib/model/file-meta')
        return done()
    })
    it(protocol + ' create', function*(done) {
        var historyVersion1 = {
            hash: 'X12345',
            device_id: 'D1',
            time: new Date().getTime()
        }
        var historyVersion2 = {
            hash: 'X12344',
            device_id: 'D2',
            time: new Date().getTime()
        }
        var meta1 = yield MiniFileMeta.addVersion(1, historyVersion1)
        var meta2 = yield MiniFileMeta.addVersion(1, historyVersion2) 
        assert(meta2.versions.length,2)

        assert(meta2.versions[0].hash,'X12344')
        assert(meta2.versions[1].hash,'X12345')
        done()
    })
})
