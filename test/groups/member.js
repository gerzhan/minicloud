var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' groups/members', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
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
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        var group = yield MiniGroup.create(user.id, 'source')
        addUser = yield MiniUser.create('James', 'james')
        yield MiniUserMeta.create(addUser.id, 'nick', 'smallwa')
        yield MiniUserMeta.create(addUser.id, 'avatar', '/images/default_avatar.png')
        yield MiniUserMeta.create(addUser.id, 'email', 'smallwa@minicloud.cn')
        yield MiniUserMeta.create(addUser.id, 'space', 1048570)
        yield MiniUserMeta.create(addUser.id, 'used_space', 10249)
        yield MiniDevice.create(addUser, 'web client', 'JsQCsjF3yr7KACyT')
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

    it(protocol + ' groups/members 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/members')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'source'
            })
            .expect(200)
            .end()
        res.body[0].name.should.equal('James')
        done()
    })
    it(protocol + ' groups/members 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/members')
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
    it(protocol + ' groups/members 409 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/members')
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
     it(protocol + ' groups/members 400 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/members')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })

})
