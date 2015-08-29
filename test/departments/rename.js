var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' department rename', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniDepartment = null
    var MiniUserDepartmentRelation = null
    var department1 = null
    var department2 = null
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
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')
        user3 = yield MiniUser.create('tom', 'tom')
        yield MiniUserMeta.create(user3.id, 'nick', 'Tom')
        user4 = yield MiniUser.create('jim', 'jim')
        yield MiniUserMeta.create(user4.id, 'nick', 'Jim')
        user5 = yield MiniUser.create('eric', 'eric')
        yield MiniUserMeta.create(user5.id, 'nick', 'Eric')

        department1 = yield MiniDepartment.create(-1, 'minicloud_inc')
        department2 = yield MiniDepartment.create(-1, 'minicloud_sale')
        department3 = yield MiniDepartment.create(department1.id, 'minicloud_sale_3')
        department4 = yield MiniDepartment.create(department3.id, 'minicloud_sale_4')
        yield MiniUserDepartmentRelation.create(department1.id, user.id, department1.path)
        yield MiniUserDepartmentRelation.create(department2.id, user2.id, department2.path)
        yield MiniUserDepartmentRelation.create(department3.id, user3.id, department3.path)
        yield MiniUserDepartmentRelation.create(department4.id, user4.id, department4.path)
        yield MiniUserDepartmentRelation.create(department4.id, user5.id, department4.path)

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
    it(protocol + ' departments/rename 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: department1.id,
                new_name: 'minicloud_dev'
            })
            .expect(200)
            .end()
        var department = yield MiniDepartment.getById(department1.id)
        department.name.should.equal('minicloud_dev')
        done()
    })
    it(protocol + ' departments/rename  socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/rename', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                id: department1.id,
                new_name: 'minicloud_dev'
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var department = yield MiniDepartment.getById(department1.id)
                department.name.should.equal('minicloud_dev')
                done()
            })()
        })
    })
    it(protocol + ' departments/rename 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: department3.id,
                new_name: 'happiness'
            })
            .expect(200)
            .end()
        var department = yield MiniDepartment.getById(department3.id)
        department.name.should.equal('happiness')
        done()
    })
    it(protocol + ' departments/rename 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 'abc',
                new_name: 'minicloud_dev'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/rename 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/rename 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                id: department1.id,
                new_name: 'minicloud_dev'
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
    it(protocol + '  departments/rename 409 department_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 10,
                new_name: 'minicloud_dev'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_not_exist')
        done()
    })
    it(protocol + '  departments/rename 409 new_name_existed', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: department2.id,
                new_name: 'minicloud_sale'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('new_name_existed')
        done()
    })
})
