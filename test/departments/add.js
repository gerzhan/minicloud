var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' department add', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    var MiniDepartment = null
    var MiniDepartmentpRelation = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin', SUPER_ADMIN)
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')

        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')


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

    it(protocol + ' departments/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/minicloud_inc/abc/efg/hij/kln'
            })
            .expect(200)
            .end()
        var departmentList = yield MiniDepartment.getChildren('')
        var departmentList2 = yield MiniDepartment.getChildren('/minicloud_inc')
        departmentList[0].name.should.equal('minicloud_inc')
        departmentList2[0].name.should.equal('abc')
        done()
    })
    it(protocol + ' departments/add 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/minicloud_inc/minicloud_dev'
            })
            .expect(200)
            .end()
        var departmentList = yield MiniDepartment.getChildren('')
        departmentList[0].name.should.equal('minicloud_inc')
        done()
    })
    it(protocol + ' departments/add 200 normalize name', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/minicloud_inc/minicl,oud_dev'
            })
            .expect(200)
            .end()
        var departmentList = yield MiniDepartment.getChildren('/minicloud_inc')
        var existed = 0
        for (var i = 0; i < departmentList.length; i++) {
            var department = departmentList[i]
            var name = department.name 
            if (name === 'minicl-oud_dev') {
                existed = 1
            }
        }
        assert(existed, 1)
        done()
    })
    it(protocol + ' departments/add socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/add', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                path: '/minicloud_inc'
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var departmentList = yield MiniDepartment.getChildren('')
                departmentList[0].name.should.equal('minicloud_inc')
                done()
            })()
        })
    })
    it(protocol + ' departments/add 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
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
    it(protocol + ' departments/add 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/add 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                path: '/minicloud_dev'
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
    it(protocol + '  departments/add 409 department_existed', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/minicloud_inc'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_existed')
        done()
    })
})
