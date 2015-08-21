var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
// var department
describe(protocol + ' members', function() {
    this.timeout(15000)
    var app = null
    var accessToken = null
        //before hook start app server,initialize data
    before(function*(done) {
        //start server
        app = yield context.getApp()
            //ready data
        var MiniApp = require('../../lib/model/app')
        var MiniUser = require('../../lib/model/user')
        var MiniUserMeta = require('../../lib/model/user-meta')
        var MiniDepartment = require('../../lib/model/department')
        var MiniUserDepartmentRelation = require('../../lib/model/user-department-relation')
        var cursor = ''
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin')
        yield MiniUserMeta.create(user.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim')
        yield MiniUserMeta.create(user.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user.id, 'is_admin', '1')

        var user2 = yield MiniUser.create('jim', 'jim')
        yield MiniUserMeta.create(user2.id, 'email', 'jim@minicloud.io')
        yield MiniUserMeta.create(user2.id, 'nick', 'lee')
        yield MiniUserMeta.create(user2.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user2.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')

        var user3 = yield MiniUser.create('tom', 'tom')
        yield MiniUserMeta.create(user3.id, 'email', 'tom@minicloud.io')
        yield MiniUserMeta.create(user3.id, 'nick', 'tom')
        yield MiniUserMeta.create(user3.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user3.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user3.id, 'is_admin', '0')

        var user4 = yield MiniUser.create('good', 'tom')
        yield MiniUserMeta.create(user4.id, 'email', 'good@minicloud.io')
        yield MiniUserMeta.create(user4.id, 'nick', '张三')
        yield MiniUserMeta.create(user4.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user4.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user4.id, 'is_admin', '0')

        var user5 = yield MiniUser.create('frozen', 'frozen')
        yield MiniUser.setStatus(user5.uuid,false)
        yield MiniUser.setStatus('xxxx',false)
        yield MiniUserMeta.create(user5.id, 'email', 'frozen@minicloud.io')
        yield MiniUserMeta.create(user5.id, 'nick', 'coldwang')
        yield MiniUserMeta.create(user5.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user5.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user5.id, 'is_admin', '0')

        department = yield MiniDepartment.create(-1, 'MiniDepartment_inc')
        departmentSon = yield MiniDepartment.create(department.id, 'MiniDepartment_inc_son')
        yield MiniUserDepartmentRelation.create(department.id, user.id)
        yield MiniUserDepartmentRelation.create(department.id, user2.id)
        yield MiniUserDepartmentRelation.create(departmentSon.id, user3.id)
        yield MiniUserDepartmentRelation.create(departmentSon.id, user4.id)

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

    it(protocol + ' members-console/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members-console/list')
            .type('json') 
            .send({
                department_id: department.id,
                limit: 2,
                condition_key:'a',
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        cursor = body.cursor
        body.has_more.should.equal(true)
        body.items[0].name.should.equal('admin')
        body.items[1].name.should.equal('good')
        done()
    })
    it(protocol + ' members-console/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members-console/list')
            .type('json') 
            .send({
                department_id: department.id,
                limit: 2,
                condition_key:'a',
                cursor:cursor
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.has_more.should.equal(false)
        body.items[0].name.should.equal('frozen')
        done()
    })
    it(protocol + ' members-console/admin_list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members-console/list')
            .type('json') 
            .send({
                department_id: department.id,
                limit:1,
                condition_admin:true
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.items[0].name.should.equal('admin')
        done()
    })
    it(protocol + ' members-console/disabled_list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members-console/list')
            .type('json') 
            .send({
                department_id: department.id,
                limit:1,
                condition_disabled:true
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.items[0].name.should.equal('frozen')
        done()
    })
    it(protocol + ' members-console/list 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members-console/list')
            .type('json')
            .send({
                department_id: 'abc'
            }) 
            .set({
                Authorization: 'Bearer '+ accessToken
            })
            .expect(400)
            .end()  
        done()
    })
    it(protocol + ' members-console/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members-console/list')
            .type('json') 
            .send({
                department_id: department.id,
                condition_key:'a',
            })
            .set({
                Authorization: 'Bearer 1234'
            })
            .expect(401)
            .end()
        done()
    })
})
