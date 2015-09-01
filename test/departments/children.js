var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' departments children', function() {
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
        var MiniDevice = require('../../lib/model/device')
        MiniDepartment = require('../../lib/model/department')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        yield MiniDepartment.create('/MiniDepartment_inc')
        yield MiniDepartment.create('/MiniDepartment_inc/MiniDepartment_dev')
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

    it(protocol + ' departments/children 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/children')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: ''
            })
            .expect(200)
            .end()
        res.body[0].name.should.equal('MiniDepartment_inc')
        done()
    })
    it(protocol + ' departments/children socket.io  200', function*(done) {
        global.socket.emit('/api/v1/departments/children', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                parent_id: -1
            }
        }, function(body) {
            body[0].name.should.equal('MiniDepartment_inc')
            done()
        })
    })
    it(protocol + ' departments/children 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/children')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/MiniDepartment_inc'
            })
            .expect(200)
            .end()
        res.body[0].name.should.equal('MiniDepartment_dev')
        done()
    })
    it(protocol + ' departments/children 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/departments/children')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })
})
