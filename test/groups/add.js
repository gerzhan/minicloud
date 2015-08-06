var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' group add', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniGroup = null
    var MiniGroupRelation = null
    before(function*(done) {

        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniGroup = require('../../lib/model/group')
        MiniGroupRelation = require('../../lib/model/group-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
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

    it(protocol + ' should add a group', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'development'
            })
            .expect(200)
            .end()
        var groupList = yield MiniGroup.getAllByUserId(user.id)
        groupList[0].name.should.equal('development')
        done()
    })
    it(protocol + ' should return 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/devices/get_my_devices')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })

    it(protocol + ' should return 409', function*(done) {
        var res = yield request(app)
            .post('/api/v1/groups/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'development'
            })
            .expect(409)
            .end()
        res.body.error_description.should.equal('group has existed.')
        done()
    })
})
