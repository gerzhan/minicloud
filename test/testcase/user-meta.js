var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' user-meta.js', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    before(function*(done) {
        app = yield context.getApp()
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        return done()
    })
    it(protocol + ' getByKey', function*(done) {
        var user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id, 'nick', 'jim')
        meta = yield MiniUserMeta.getByKey(user.id, 'nick')
        assert.equal(meta.value, 'jim')
        meta = yield MiniUserMeta.getByKey(user.id, 'nick1')
        assert.equal(meta, null)
        done()
    })
    it(protocol + ' updatePasswordErrorTimes', function*(done) {
        yield MiniUserMeta.updatePasswordErrorTimes(2)
        meta = yield MiniUserMeta.getByKey(2, 'password_error_count')
        assert.equal(meta.value, '1')
        done()
    })
    it(protocol + ' resetPasswordErrorTimes', function*(done) {
        yield MiniUserMeta.updatePasswordErrorTimes(2)
        meta = yield MiniUserMeta.resetPasswordErrorTimes(2)
        assert.equal(meta.value, '0')
        done()
    })
    // it(protocol + ' isLocked', function*(done) {
    //     var co = require('co')
    //     var user = yield MiniUser.create('admin', 'admin')
    //         //lock user
    //     var meta = yield MiniUserMeta.create(user.id, 'password_error_count', '5')
    //         //after 15 minutes
    //     var now = new Date()
    //     var afterTime = now.getTime() - 15 * 60 * 1000
    //     var afterDate = new Date()
    //     afterDate.setTime(afterTime)
    //     var db = global.dbPool.db 
    //     db.driver.execQuery('update '+global.dbPool.userMetaModel.table+' set updated_at=? where id=?', [afterDate, meta.id], function(err, data) {
    //         co.wrap(function*() {
    //             //reset password_error_count=0
    //             yield MiniUserMeta.isLocked(user.id)
    //             var newMeta = yield MiniUserMeta.getByKey(user.id, 'password_error_count')
    //             assert.equal(newMeta.value, '0')
    //             done()
    //         })()

    //     })

    // })
})
