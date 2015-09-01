var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' department remove', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniDepartment = null
    var department1 = null
    var department2 = null
    var department3 = null
    before(function*(done) {
        app = yield context.getApp()

        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id, 'is_admin', '1')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')

        department1 = yield MiniDepartment.create('/minicloud_inc')
        department2 = yield MiniDepartment.create('/minicloud_inc/minicloud_dev')
        department3 = yield MiniDepartment.create('/minicloud_inc/minicloud_market')
        yield MiniUser.bindUserToDepartment(user2.id, department2.path)

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

    it(protocol + ' departments/remove 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department3.path
            })
            .expect(200)
            .end()
        var departmentList = yield MiniDepartment.getById(department3.id)
        var assert = require('assert')
        assert.equal(departmentList, null)
        done()
    })
    it(protocol + ' departments/remove 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: ''
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/remove 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/remove 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                path: department1.path
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
    it(protocol + '  departments/remove 409 department_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/xxxxx'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_not_exist')
        done()
    })
    it(protocol + '  departments/remove 409 department_remains_subsectors', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department1.path
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_remains_subsectors')
        done()
    })
    it(protocol + '  departments/remove 409 department_remains_users', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department2.path
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_remains_users')
        done()
    })
})
