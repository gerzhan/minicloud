var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' departments users remove', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniDepartment = null
    var uuid = null
    var userId = null
    var department = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin',SUPER_ADMIN)
        uuid = user.uuid
        userId = user.id
        yield MiniUserMeta.create(user.id, "is_admin", '1')
        yield MiniUserMeta.create(user.id, "nick", 'Allis')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, "nick", 'Peter')
        department = yield MiniDepartment.create("/MiniDepartment_inc")
        yield MiniUser.bindUserToDepartment(user.id, department.path)
        yield MiniUser.bindUserToDepartment(user2.id, department.path)
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

    it(protocol + ' departments/users/remove 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department.path,
                uuid: uuid
            })
            .expect(200)
            .end()
            var user = yield MiniUser.getById(userId)
            var assert = require('assert')
            var departmentPath = user.department_path
            assert.equal(departmentPath,null)
        done()
    })
    it(protocol + ' departments/users/remove socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/users/remove', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                path: department.path,
                uuid: uuid
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var user = yield MiniUser.getById(userId)
                var assert = require('assert')
                var departmentPath = user.department_path
                assert.equal(departmentPath,null)
                done()
            })()
        })
    })
    it(protocol + ' departments/users/remove 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '',
                uuid: 'xxx'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/users/remove 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                path: department.path,
                uuid: uuid
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/users/remove 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                path: department.path,
                uuid: uuid
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
    it(protocol + ' departments/users/remove 409 department_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: "/xxxx",
                uuid: uuid
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_not_exist')
        done()
    })
    it(protocol + ' departments/users/remove 409 user_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/users/remove')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department.path,
                uuid: 'xxxx'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('user_not_exist')
        done()
    })
})
