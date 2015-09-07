var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
// var department
describe(protocol + ' console-events', function() {
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
        var MiniDevice = require('../../lib/model/device')
        var MiniEvent = require('../../lib/model/event')
        var MiniDepartment = require('../../lib/model/department')
        var cursor = ''
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        var user = yield MiniUser.create('admin', 'admin', 9)
        var device = yield MiniDevice.create(user, 'chrome', 'JsQCsjF3yr7KACyT')
        MiniEvent.createLoginEvent('192.168.0.101',device)
        yield MiniUserMeta.create(user.id, 'email', 'app@minicloud.io')
        yield MiniUserMeta.create(user.id, 'nick', 'jim')
        yield MiniUserMeta.create(user.id, 'phone', '+864000250057')
        yield MiniUserMeta.create(user.id, 'total_space', '1073741824')

        var user2 = yield MiniUser.create('jim', 'jim', 1)
        var device2 = yield MiniDevice.create(user2, 'firefox', 'JsQCsjF3yr7KACyT')
        yield MiniEvent.createLoginEvent('192.168.0.102',device2)
        yield MiniEvent.createLogoutEvent('192.168.0.102',device2)
        yield MiniUserMeta.create(user2.id, 'email', 'jim@minicloud.io')
        yield MiniUserMeta.create(user2.id, 'nick', 'lee')
        yield MiniUserMeta.create(user2.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user2.id, 'total_space', '1073741824')

        var user3 = yield MiniUser.create('tom', 'tom', 3)
        var device3 = yield MiniDevice.create(user3, 'safari', 'JsQCsjF3yr7KACyT')
        yield MiniEvent.createLoginEvent('192.168.0.103',device3)
        yield MiniUserMeta.create(user3.id, 'email', 'tom@minicloud.io')
        yield MiniUserMeta.create(user3.id, 'nick', 'tom')
        yield MiniUserMeta.create(user3.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user3.id, 'total_space', '1073741824')

        var user4 = yield MiniUser.create('good', 'tom', 1)
        var device4 = yield MiniDevice.create(user4, 'IE', 'JsQCsjF3yr7KACyT')
        yield MiniEvent.createLoginEvent('192.168.0.104',device4)
        yield MiniUserMeta.create(user4.id, 'email', 'good@minicloud.io')
        yield MiniUserMeta.create(user4.id, 'nick', '张三')
        yield MiniUserMeta.create(user4.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user4.id, 'total_space', '1073741824')

        var user5 = yield MiniUser.create('frozen', 'frozen', 1)
        var device5 = yield MiniDevice.create(user5, '360', 'JsQCsjF3yr7KACyT')
        yield MiniEvent.createLoginEvent('192.168.0.105',device5)
        yield MiniUser.setStatus(user5.uuid,false)
        yield MiniUser.setStatus('xxxx',false)
        yield MiniUserMeta.create(user5.id, 'email', 'frozen@minicloud.io')
        yield MiniUserMeta.create(user5.id, 'nick', 'coldwang')
        yield MiniUserMeta.create(user5.id, 'phone', '+868655201')
        yield MiniUserMeta.create(user5.id, 'total_space', '1073741824')

        department = yield MiniDepartment.create('/MiniDepartment_inc')
        departmentSon = yield MiniDepartment.create('/MiniDepartment_inc/MiniDepartment_inc_son')

        yield MiniUser.bindUserToDepartment(user.id, department.path)
        yield MiniUser.bindUserToDepartment(user2.id, department.path)
        yield MiniUser.bindUserToDepartment(user3.id, departmentSon.path)
        yield MiniUser.bindUserToDepartment(user4.id, departmentSon.path)
        yield MiniUser.bindUserToDepartment(user5.id, departmentSon.path)
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

    it(protocol + ' events-console/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/event/list')
            .type('json') 
            .send({
                department_path: department.path,
                limit: 1,
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end() 
        var body = res.body
        cursor = body.cursor
        body.has_more.should.equal(true)
        body.events[0].device_name.should.equal('ji1111m-pc-windows7')

        var res = yield request(app)
            .post('/api/v1/console/event/list')
            .type('json') 
            .send({
                department_path: department.path,
                limit: 2,
                cursor:cursor
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var body = res.body
        body.has_more.should.equal(true)
        body.events[0].device_name.should.equal('ji1111m-pc-windows7')
        body.events[1].device_name.should.equal('360')
        done()
    })
    it(protocol + ' events-console/list 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/event/list')
            .type('json') 
            .send({
                department_path: departmentSon.path
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end() 
        var body = res.body
        cursor = body.cursor
        body.has_more.should.equal(false)
        body.events.length.should.equal(4)
        body.events[0].device_name.should.equal('ji1111m-pc-windows7')
        done()
    })
    it(protocol + ' events-console/list 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/console/event/list')
            .type('json') 
            .send({
                department_path: department.path
            })
            .set({
                Authorization: 'Bearer 1234'
            })
            .expect(401)
            .end()
        done()
    })
})
