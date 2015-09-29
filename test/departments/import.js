var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' department import', function() {
    this.timeout(global.timeout)
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
        yield MiniUserMeta.create(user.id, 'is_admin', '1')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        user2 = yield MiniUser.create('peter', 'peter')
        yield MiniUserMeta.create(user2.id, 'is_admin', '0')
        user3 = yield MiniUser.create('tom', 'tom')
        yield MiniUser.create('jony', 'jony')
        yield MiniUser.create('ryan', 'ryan')
        yield MiniUser.create('yili', 'yili')
        yield MiniUser.create('tjx', 'tjx')

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

    it(protocol + ' departments/import 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/import')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                data: [{
                    'department-user': '/minicloud_inc/market/chengdu_office,tom,jony'
                }, {
                    'department-user': '/minicloud_inc/R&D/office,ryan,yili,tjx,jim'
                }]
            })
            .expect(200)
            .end()
        var department = yield MiniDepartment.getByPath('/minicloud_inc')
        department.name.should.equal('minicloud_inc')
        var user = yield MiniUser.getById(user3.id)
        user.name.should.equal('tom')
        res.body.success_count.should.equal(5)
        res.body.user_not_exist[0].should.equal('jim')
        done()
    })
    it(protocol + ' departments/import 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/import')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                data: [{
                    'department-user': '/minicloud_inc/market/chengdu_office/'
                }, {
                    'department-user': '/minicloud_inc/R&D/office,'
                }]
            })
            .expect(200)
            .end()
        res.body.success_count.should.equal(0)
        res.body.failed_count.should.equal(0)
        done()
    })
    it(protocol + ' departments/import socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/import', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                data: [{
                    'department-user': '/minicloud_inc/market/chengdu_office/'
                }, {
                    'department-user': '/minicloud_inc/R&D/office,'
                }]
            }
        }, function(body) {
            body.success_count.should.equal(0)
            body.failed_count.should.equal(0)
            done()
        })
    })
    it(protocol + ' departments/import 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/import')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                data: ''
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' departments/import 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/import')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
    it(protocol + ' departments/import 401 require_administrator_token', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/import')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken2
            })
            .send({
                data: [{
                    'department-user': '/minicloud_inc/market/chengdu_office,tom,jony'
                }, {
                    'department-user': '/minicloud_inc/R&D/office,ryan,yili,tjx,jim'
                }]
            })
            .expect(401)
            .end()
        res.body.error.should.equal('require_administrator_token')
        done()
    })
})
