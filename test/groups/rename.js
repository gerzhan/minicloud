var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' groups/rename', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniGroup = null
    var MiniUserGroupRelation = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniGroup = require('../../lib/model/group')
        MiniUserGroupRelation = require('../../lib/model/user-group-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        yield MiniGroup.create(user.id, 'source')
        yield MiniGroup.create(user.id, 'market')
       
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
it(protocol + ' groups/rename 409 old_group_not_exist', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'sourcesssss',
                new_name: 'koakoa'
            })
            .expect(409)
            .end()
            res.body.error.should.equal('old_group_not_exist')
        done()
    })
it(protocol + ' groups/rename 409 new_group_existed', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'source',
                new_name: 'market'
            })
            .expect(409)
            .end()
            res.body.error.should.equal('new_group_existed')
        done()
    })

 it(protocol + ' groups/rename 200', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'source',
                new_name: 'koakoa'
            })
            .expect(200)
            .end()
       var group = yield MiniGroup.getByName(user.id, 'koakoa')
       group.name.should.equal('koakoa')
        done()
    })
 it(protocol + ' groups/rename 200', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'koakoa',
                new_name: 'koakoa'
            })
            .expect(200)
            .end()
       var group = yield MiniGroup.getByName(user.id, 'koakoa')
       group.name.should.equal('koakoa')
        done()
    })
 it(protocol + ' groups/rename 400', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
 it(protocol + ' groups/rename 401', function*(done) {

        var res = yield request(app)
            .post('/api/v1/groups/rename')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                old_name: 'source',
                new_name: 'koakoa'
            })
            .expect(401)
            .end()
        done()
    })

})