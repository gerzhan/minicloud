var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' event', function() {
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
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        yield MiniUser.create('admin', 'admin')
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
    // it(protocol + ' events/list 200', function*(done) {
    //     var res = yield request(app)
    //         .post('/api/v1/events/list')
    //         .type('json')
    //         .set({
    //             Authorization: 'Bearer ' + accessToken
    //         })
    //         .expect(200)
    //         .end()
    //     res.body.events[1].ip.should.equal('::ffff:127.0.0.1')
    //     res.body.events[0].summary.file_name.should.equal('1.doc')
    //     res.body.events.length.should.equal(2)
    //     done()
    // })
    it(protocol + ' events/clean_login_events 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/clean_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        var eventModel = sequelizePool.eventModel
        var count = yield eventModel.count({
            where: {
                user_id: 1,
                type: 1
            }
        })
        assert.equal(count, 0)
        done()
    })
    it(protocol + ' events/clean_login_events 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/clean_login_events')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .expect(401)
            .end()
        done()
    })
})
