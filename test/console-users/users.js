var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
// var department
describe(protocol + ' console-users', function() {
    this.timeout(global.timeout)
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
        var cursor = ''
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin')
        user.role = 9
        yield user.save()
        yield MiniUserMeta.create(user.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim')
        yield MiniUserMeta.create(user.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user.id, 'is_admin', '1')

        var user2 = yield MiniUser.create('jim', 'jim')
        user2.role = 1
        yield user2.save()
        yield MiniUserMeta.create(user2.id, 'email', 'jim@minicloud.io')
        yield MiniUserMeta.create(user2.id, 'nick', 'lee')
        yield MiniUserMeta.create(user2.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user2.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')

        var user3 = yield MiniUser.create('tom', 'tom')
        user3.role = 3
        yield user3.save()
        yield MiniUserMeta.create(user3.id, 'email', 'tom@minicloud.io')
        yield MiniUserMeta.create(user3.id, 'nick', 'tom')
        yield MiniUserMeta.create(user3.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user3.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user3.id, 'is_admin', '0')

        var user4 = yield MiniUser.create('good', 'tom')
        user4.role = 1
        yield user4.save()
        yield MiniUserMeta.create(user4.id, 'email', 'good@minicloud.io')
        yield MiniUserMeta.create(user4.id, 'nick', '张三')
        yield MiniUserMeta.create(user4.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user4.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user4.id, 'is_admin', '0')

        var user5 = yield MiniUser.create('frozen', 'frozen')
        user5.role = 1
        yield user5.save()
        yield MiniUser.setStatus(user5,0) 
        yield MiniUserMeta.create(user5.id, 'email', 'frozen@minicloud.io')
        yield MiniUserMeta.create(user5.id, 'nick', 'coldwang')
        yield MiniUserMeta.create(user5.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user5.id, 'total_space', '1073741824')
        yield MiniUserMeta.create(user5.id, 'is_admin', '0')

        department = yield MiniDepartment.create('/MiniDepartment_inc')
        departmentSon = yield MiniDepartment.create('/MiniDepartment_inc/MiniDepartment_inc_son')

        yield MiniUser.bindUserToDepartment(user.id, department.path)
        yield MiniUser.bindUserToDepartment(user2.id, department.path)
        yield MiniUser.bindUserToDepartment(user3.id, departmentSon.path)
        yield MiniUser.bindUserToDepartment(user4.id, departmentSon.path)
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
                name: 'tom',
                password: 'tom',
                device_name: 'ji1111m-pc-windows7',
                client_id: 'JsQCsjF3yr7KACyT',
                client_secret: 'bqGeM4Yrjs3tncJZ'
            })
            .expect(200)
            .end()
            //set access_token
        accessToken2 = res.body.access_token
        return done()
    })

    it(protocol + ' users-console/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json') 
            .send({
                department_path: department.path,
                limit: 1,
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
        body.users[0].name.should.equal('admin')

        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json') 
            .send({
                department_path: department.path,
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
        body.users[0].name.should.equal('good')
        done()
    })
    it(protocol + ' users-console/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json') 
            .send({
                department_path: department.path,
                limit: 1,
                condition_key:'a',
            })
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .expect(200)
            .end() 
        var body = res.body
        cursor = body.cursor
        body.has_more.should.equal(false)
        body.users[0].name.should.equal('good')
        done()
    })
    it(protocol + ' users-console/admin_list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json') 
            .send({
                department_path: department.path,
                limit:1,
                condition_admin:true
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.users[0].name.should.equal('admin')
        done()
    })
    it(protocol + ' users-console/disabled_list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json') 
            .send({
                department_path: department.path,
                limit:1,
                condition_disabled:true
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.has_more.should.equal(false)
        done()
    })
    it(protocol + ' users-console/list 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json')
            .send({
            }) 
            .set({
                Authorization: 'Bearer '+ accessToken
            })
            .expect(400)
            .end()  
        done()
    })
    it(protocol + ' users-console/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/users/list')
            .type('json') 
            .send({
                department_path: department.path,
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
