var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' groups/remove', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var group = null
    var addUser = null
    var MiniGroup = null
    var MiniUserGroupRelation = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        var MiniDevice = require('../../lib/model/device')
        MiniGroup = require('../../lib/model/group')
        MiniUserGroupRelation = require('../../lib/model/user-group-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        group = yield MiniGroup.create(user.id, 'source')
        addUser = yield MiniUser.create('James', 'james')
        yield MiniUserMeta.create(addUser.id, 'nick', 'smallwa')
        yield MiniUserMeta.create(addUser.id, 'avatar', '/images/default_avatar.png')
        yield MiniUserMeta.create(addUser.id, 'email', 'smallwa@minicloud.cn')
        yield MiniUserMeta.create(addUser.id, 'space', 1048570)
        yield MiniUserMeta.create(addUser.id, 'used_space', 10249)
        yield MiniUserGroupRelation.create(group.id, addUser.id)
        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'admin',
                password: 'admin',
                device_name: 'ji1111m-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
            //set access_token
        accessToken = res.body.access_token
        return done()
    })

    it(protocol + ' groups/remove 200', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'source'
            })
            .expect(200)
            .end()
        var existed = yield MiniUserGroupRelation.exist(group.id, addUser.id)
        existed.should.equal(false)
        var existed2 = yield MiniGroup.exist(user.id, 'source')
        existed2.should.equal(false)
        done()
    })
    it(protocol + ' groups/remove socket.io  200', function*(done) {
        global.socket.emit('/api/v1/groups/remove', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                name: 'source'
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var existed = yield MiniUserGroupRelation.exist(group.id, addUser.id)
                existed.should.equal(false)
                var existed2 = yield MiniGroup.exist(user.id, 'source')
                existed2.should.equal(false)
                done()
            })()
        })
    })
    it(protocol + ' groups/remove 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/remove')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                name: 'source'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' groups/remove 409 group_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'sourcesssss'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('group_not_exist')
        done()
    })
    it(protocol + ' groups/remove 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
})
