var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/get_all_event', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var user = null
    var file = null
    var device = null
    var addUser = null

    var MiniFile = null
    var MiniFileTagRelation = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        var MiniVersion = require('../../lib/model/version')
        MiniFile = require('../../lib/model/file')
        MiniFileTagRelation = require('../../lib/model/file-tag-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
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
            //get current device
        var devices = yield MiniDevice.getAllByUserId(user.id)
        device = devices[0]
        for (var i = 0; i < devices.length; i++) {
            var item = devices[i]
            if (item.client_id === 'JsQCsjF3yr7KACyT') {
                device = item
            }
        }
        var version = yield MiniVersion.create('X1234567', 1073741825, 'doc')
        file = yield MiniFile.createFile(device, '/Image/123/1.doc', version, null)

        var res = yield request(app)
            .post('/api/v1/files/delete')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: '/Image/123/1.doc'
            })
            .expect(200)
            .end()
        return done()
    })

    it(protocol + ' events/files/get_all_event 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/files/get_all_event')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(200)
            .end()
        res.body.events[1].ip.should.equal('::ffff:127.0.0.1')
        res.body.events[0].summary.file_name.should.equal('1.doc')
        res.body.events.length.should.equal(2)
        done()
    })

    it(protocol + ' events/files/get_all_event socket.io 200 ', function*(done) {
        global.socket.emit('/api/v1/events/files/get_all_event', {
            header: {
                Authorization: 'Bearer ' + accessToken
            }
        }, function(body) {
           body.events[1].ip.should.equal('::ffff:127.0.0.1')
           body.events[0].summary.file_name.should.equal('1.doc')
           body.events.length.should.equal(2)
            done()
        })
    })
    it(protocol + ' events/files/get_all_event 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/files/get_all_event')
            .type('json')
            .send({
                limit: 'abc'
            })
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' events/files/get_all_event 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/events/files/get_all_event')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .expect(401)
            .end()
        done()
    })

})
