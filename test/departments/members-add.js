var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' departments members add', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniDepartment = null
    var uuid = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        MiniUserDepartmentRelation = require('../../lib/model/user-group-relation')
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        uuid = user.uuid
        yield MiniUserMeta.create(user.id,"is_admin",'1')
        yield MiniUserMeta.create(user.id,"nick",'Allis')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id,"nick",'Peter')
        var department = yield MiniDepartment.create(-1,"MiniDepartment_inc")
        yield MiniUserDepartmentRelation.create(department.id,user.id)
        yield MiniUserDepartmentRelation.create(department.id,user2.id)
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

    it(protocol + ' departments/membersAdd 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/membersAdd')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 1,
                uuid:uuid
            })
            .expect(200)
            .end()
        // res.body[0].nick.should.equal('Allis')
        done()
    })
    it(protocol + ' departments/membersAdd 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/membersAdd')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 'abc',
                uuid:'xxx'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/membersAdd 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/membersAdd')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                id: 1,
                uuid:uuid
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/membersAdd 409 department not exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/membersAdd')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 10,
                uuid:uuid
            })
            .expect(409)
            .end()
        done()
    })
    it(protocol + ' departments/membersAdd 409 member not exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/membersAdd')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 1,
                uuid:'xxxx'
            })
            .expect(409)
            .end()
        done()
    })
})
