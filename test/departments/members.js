var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' departments members', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniDepartment = null
    var department1 = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        MiniUserDepartmentRelation = require('../../lib/model/user-department-relation')
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id, 'is_admin', '1')
        yield MiniUserMeta.create(user.id, 'nick', 'Allis')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')
        yield MiniUserMeta.create(user2.id, 'nick', 'Peter')
        department1 = yield MiniDepartment.create(-1, 'MiniDepartment_inc')
        yield MiniUserDepartmentRelation.create(department1.id, user.id, department1.path)
        yield MiniUserDepartmentRelation.create(department1.id, user2.id, department1.path)
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

        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'peter',
                password: 'peter',
                device_name: 'peter-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
            //set access_token
        accessToken2 = res.body.access_token
        return done()
    })

    it(protocol + ' departments/members 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: department1.id
            })
            .expect(200)
            .end()
        res.body[0].metas.nick.should.equal('Allis')
        done()
    })
    it(protocol + ' departments/members 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 'abc'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/members 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/members 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                id: department1.id
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
    it(protocol + ' departments/members 409 department_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 10
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_not_exist')
        done()
    })
})
