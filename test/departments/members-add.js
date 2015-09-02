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
        yield MiniUserMeta.create(user.id, 'is_admin', '1')
        yield MiniUserMeta.create(user.id, 'nick', 'Allis')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        uuid = user.uuid
        userId = user.id
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'nick', 'Peter')
        uuid2 = user2.uuid
        userId2 = user2.id
        user3 = yield MiniUser.create('tom', 'tom')
        yield MiniUserMeta.create(user3.id, 'nick', 'Tom')
        uuid3 = user3.uuid
        userId3 = user3.id

        department = yield MiniDepartment.create('/MiniDepartment_inc')
        department2 = yield MiniDepartment.create('/MiniDepartment_inc/MiniDepartment_inc2')
        department3 = yield MiniDepartment.create('/MiniDepartment_inc/MiniDepartment_inc2/MiniDepartment_inc3')
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
                path: department.path,
                uuid: uuid,
            })
            .expect(200)
            .end()
            var member = yield MiniUser.getByUuid(uuid)
            member.department_path.should.equal(department.path)
        done()
    })

    it(protocol + ' departments/members/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department2.path,
                uuid: uuid2,
            })
            .expect(200)
            .end()
            var member = yield MiniUser.getByUuid(uuid2)
            member.department_path.should.equal(department2.path)
        done()
    })

    it(protocol + ' departments/members/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/members/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: department3.path,
                uuid: uuid3,
            })
            .expect(200)
            .end()
            var member = yield MiniUser.getByUuid(uuid3)
            member.department_path.should.equal(department3.path)
        done()
    })
    it(protocol + ' departments/members/add socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/members/add', {
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
                var member = yield MiniUser.getByUuid(uuid)
                member.department_path.should.equal(department.path)
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
                path: '',
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
                path: department.path,
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
                path: department.path,
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
                path: "/xxxx",
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
                path: department.path,
                uuid: 'xxxx',
            })
            .expect(409)
            .end()
        res.body.error.should.equal('member_not_exist')
        done()
    })
})
