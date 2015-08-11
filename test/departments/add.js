var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

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
        user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id,"is_admin",'1')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')

        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id,"is_admin",'0')
        

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

    it(protocol + ' should add a department', function*(done) { 
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                parent_id:-1,
                name: 'minicloud_inc'
            })
            .expect(200)
            .end() 
        var departmentList = yield MiniDepartment.getChildren(-1) 
        departmentList[0].name.should.equal('minicloud_inc')
        done()
    })
    it(protocol + ' should return 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer '+ accessToken
            })
            .send({
                parent_id:"abc",
                name: 'minicloud_inc'
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' should return 401', function*(done) {
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
    it(protocol + ' should return 409 department_existed', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/add')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                parent_id:-1,
                name: 'minicloud_inc'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('department_existed')
        done()
    })
    // it(protocol + ' should return 409', function*(done) {
    //     var res = yield request(app)
    //         .post('/api/v1/departments/add')
    //         .type('json')
    //         .set({
    //             Authorization: 'Bearer '+accessToken2
    //         })
    //         .send({
    //             parent_id:-1,
    //             name: 'minicloud_dev'
    //         })
    //         .expect(409)
    //         .end()
    //     res.body.error.should.equal('department_existed')
    //     done()
    // })
})