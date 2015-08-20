var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' file.js', function() {
    this.timeout(10000)
    var app = null
    var MiniFile = null
    before(function*(done) {
        app = yield context.getApp()
        MiniFile = require('../../lib/model/file')
        return done()
    })
    it(protocol + ' overwrite model', function*(done) {
        var MiniVersion = require('../../lib/model/version')
        var version1 = yield MiniVersion.create('X11', 1024, 'doc')
        var filePath = '/home/测试A.doc'
        var file = yield MiniFile.createFile(1, filePath, version1, {
            client_modified: new Date().getTime()
        })
        var version2 = yield MiniVersion.create('X12', 1024, 'doc')
        var file1 = yield MiniFile.createFile(1, filePath, version2, {
            model:'overwrite',
            client_modified: new Date().getTime()
        })
        done()
    })
})
