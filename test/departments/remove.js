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
    before(function*(done) { 
        app = yield context.getApp()

        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        MiniUserDepartmentRelation = require('../../lib/model/user-department-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id,"is_admin",'1')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id,"is_admin",'0')

        yield MiniDepartment.create(1,'minicloud_inc')
        var department2 = yield MiniDepartment.create(2,'minicloud_dev')
        yield MiniUserDepartmentRelation.create(department2.id,user2.id)
        
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
                id:1
            })
            .expect(200)
            .end() 
        var departmentList = yield MiniDepartment.getById(1)
        var assert = require('assert')
        assert.equal(departmentList,null)
        done()
    })
    it(protocol + ' departments/remove 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/remove')
            .type('json')
            .set({
                Authorization: 'Bearer '+ accessToken
            })
            .send({
                id:"xx"
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
                Authorization: 'Bearer '+accessToken2
            })
            .send({
                id:2
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
                id:10
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_not_exist')
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
                id:2
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_remains_users')
        done()
    })
})
