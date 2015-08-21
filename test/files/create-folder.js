var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' files/create_folder', function() {
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
        user = yield MiniUser.create('ADMIN1', 'ADMIN1')
        yield MiniDevice.create(user, 'web client', 'JsQCsjF3yr7KACyT')

        var res = yield request(app)
            .post('/api/v1/oauth2/token')
            .type('json')
            .send({
                name: 'ADMIN1',
                password: 'ADMIN1',
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

    it(protocol + ' files/create_folder 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/create_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .send({
                path: 'Image',
            })
            .expect(200)
            .end()
        res.body.name.should.equal('Image')
        res.body.path_lower.should.equal('/' + user.id + '/image')
        done()
    })
    it(protocol + ' files/create_folder 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/create_folder')
            .type('json')
            .set({
                Authorization: 'Bearer ' + accessToken
            })
            .expect(400)
            .end()
        done()
    })
    it(protocol + ' files/create_folder 401', function*(done) {
        var res = yield request(app)
            .post('/api/v1/files/create_folder')
            .type('json')
            .set({
                Authorization: 'Bearer 1234'
            })
            .send({
                path: 'Image',
            })
            .expect(401)
            .end()
        done()
    })
})
