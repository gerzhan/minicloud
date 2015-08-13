var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' tags/files', function() {
    this.timeout(10000)
    var app = null
    var MiniUser = null
    var user = null
    var tag = null
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
        tag = yield MiniTag.create(user.id, 'green')
        file = yield MiniFile.create(1, 1, 1439349235, 1439349235, 'test', 0, 0, ' /1/abc/test', 0, null)
        yield MiniFileTagRelation.create(tag.id,file.id)
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

it(protocol + ' tags/files 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'green'
            })
            .expect(200)
            .end()
         res.body[0].name.should.equal('test')
        done()
    })
it(protocol + ' tags/files 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer 12234'
            })
            .send({
                name: 'green'
            })
            .expect(401)
            .end()
        done()
    })
it(protocol + ' tags/files 409 tag_not_exist', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                name: 'greennnn'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('tag_not_exist')
        done()
    })
 it(protocol + ' tags/files 400 ', function*(done) {
        var res = yield request(app)
            .post('/api/v1/tags/files')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })

})