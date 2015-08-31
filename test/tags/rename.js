var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' tags/rename', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var user = null
    var file = null
    var addUser = null
    var MiniTag = null
    var MiniFile = null
    var MiniFileTagRelation = null
    before(function*(done) {
        app = yield context.getApp()
        var MiniApp = require('../../lib/model/app')
        MiniUser = require('../../lib/model/user')
        var MiniDevice = require('../../lib/model/device')
        MiniTag = require('../../lib/model/tag')
        MiniFile = require('../../lib/model/file')
        MiniFileTagRelation = require('../../lib/model/file-tag-relation')
        yield MiniApp.create(-1, 'web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'web client')
        user = yield MiniUser.create('admin', 'admin')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')
        yield MiniTag.create(user.id, 'green')
        yield MiniTag.create(user.id, 'black')
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

    it(protocol + ' tags/rename 409 old_tag_not_exist', function*(done) {

        var res = yield request(app)
            .post('/api/v1/tags/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'greennnnnnn',
                new_name: 'white'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('old_tag_not_exist')
        done()
    })
    it(protocol + ' tags/rename 409 new_tag_existed', function*(done) {

        var res = yield request(app)
            .post('/api/v1/tags/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'green',
                new_name: 'black'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('new_tag_existed')
        done()
    })
    it(protocol + ' tags/rename 200', function*(done) {

        var res = yield request(app)
            .post('/api/v1/tags/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'green',
                new_name: 'white'
            })
            .expect(200)
            .end()
        var tag = yield MiniTag.getByName(user.id, 'white')
        tag.name.should.equal('white')
        done()
    })
    it(protocol + ' tags/rename 200', function*(done) {

        var res = yield request(app)
            .post('/api/v1/tags/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                old_name: 'black',
                new_name: 'black'
            })
            .expect(200)
            .end()
        var tag = yield MiniTag.getByName(user.id, 'black')
        tag.name.should.equal('black')
        done()
    })
    it(protocol + ' tags/rename socket.io  200', function*(done) {
        global.socket.emit('/api/v1/tags/rename', {
            header: {
                Authorization: 'Bearer ' + accessToken
            },
            data: {
                old_name: 'black',
                new_name: 'black'
            }
        }, function(body) {
            var co = require('co')
            co.wrap(function*() {
                var tag = yield MiniTag.getByName(user.id, 'black')
                tag.name.should.equal('black')
                done()
            })()
        })
    })
    it(protocol + ' tags/rename 400', function*(done) {

        var res = yield request(app)
            .post('/api/v1/tags/rename')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' tags/rename 401', function*(done) {

        var res = yield request(app)
            .post('/api/v1/tags/rename')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                old_name: 'green',
                new_name: 'white'
            })
            .expect(401)
            .end()
        done()
    })


})
