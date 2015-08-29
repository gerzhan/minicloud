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
    var userId = null
    var MiniUserDepartmentRelation = null
    var department = null
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
        uuid = user.uuid
        userId = user.id
        yield MiniUserMeta.create(user.id, 'is_admin', '1')
        yield MiniUserMeta.create(user.id, 'nick', 'Allis')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'nick', 'Peter')
        user3 = yield MiniUser.create('tom', 'tom')
        yield MiniUserMeta.create(user3.id, 'nick', 'Tom')
        user4 = yield MiniUser.create('jim', 'jim')
        yield MiniUserMeta.create(user4.id, 'nick', 'Jim')
        user5 = yield MiniUser.create('eric', 'eric')
        yield MiniUserMeta.create(user5.id, 'nick', 'Eric')

        department = yield MiniDepartment.create(-1, 'MiniDepartment_inc')
        department2 = yield MiniDepartment.create(department.id, 'MiniDepartment_inc2')
        department3 = yield MiniDepartment.create(department2.id, 'MiniDepartment_inc3')
        yield MiniUserDepartmentRelation.create(department.id, user.id, department.path)
        yield MiniUserDepartmentRelation.create(department2.id, user2.id, department2.path)
        yield MiniUserDepartmentRelation.create(department3.id, user3.id, department3.path)
        yield MiniUserDepartmentRelation.create(department3.id, user4.id, department3.path)
        yield MiniUserDepartmentRelation.create(department3.id, user5.id, department3.path)
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

    it(protocol + ' departments/members/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: department.id,
                uuid: uuid,
            })
            .expect(200)
            .end()
        var memberList = yield MiniUserDepartmentRelation.getAllByDepartmentId(1)
        memberList[0].id.should.equal(userId)
        done()
    })
    it(protocol + ' departments/members/add socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/members/add', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                id: department.id,
                uuid: uuid
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var memberList = yield MiniUserDepartmentRelation.getAllByDepartmentId(1)
                memberList[0].id.should.equal(userId)
                done()
            })()
        })
    })
    it(protocol + ' departments/members/add 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 'abc',
                uuid: 'xxx',
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/members/add 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                id: department.id,
                uuid: uuid,
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/members/add 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                id: department.id,
                uuid: uuid,
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
    it(protocol + ' departments/members/add 409 department_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: 10,
                uuid: uuid,
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_not_exist')
        done()
    })
    it(protocol + ' departments/members/add 409 member_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                id: department.id,
                uuid: 'xxxx',
            })
            .expect(409)
            .end()
        res.body.error.should.equal('member_not_exist')
        done()
    })
})
