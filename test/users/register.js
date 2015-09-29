var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' users/register', function() {
    this.timeout(global.timeout)
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        user = yield MiniUser.create('Jerry', '1a3c4s')
        var metaNick = yield MiniUserMeta.create(user.id, 'nick', 'littleJerry')
        var metaEmail = yield MiniUserMeta.create(user.id, 'email', 'Jerry@minicloud.io')
        return done()
    })
    it(protocol + ' users/register 200', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/register')
            .type('json')
            .send({
                name: 'Allen',
                password: '8k9v6n',
                nick: 'littleAllen',
                email: 'Allen@minicloud.io'
            })
            .expect(200)
            .end()
        var userObj = yield MiniUser.getByName('Allen')
        userObj.name.should.equal('Allen')
        var id = userObj.id
        var metaList = yield MiniUserMeta.getAll(id)
        var metaCount = 0
        for(var i=0;i<metaList.length;i++){
            var meta = metaList[i]
            if(meta.value==='littleAllen'){
                metaCount++
            }
            if(meta.value==='Allen@minicloud.io'){
                metaCount++
            }
        }  
        metaCount.should.equal(2) 
        done()
    })
    it(protocol + ' users/register 200 normalize name', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/register')
            .type('json')
            .send({
                name: 'Allen,1',
                password: '8k9v6n',
                nick: 'littleAllen'
            })
            .expect(200)
            .end()
        var user = yield MiniUser.getByName('Allen-1')
        user.name.should.equal('Allen-1') 
        done()
    })
    it(protocol + ' users/register 400', function*(done) {
        var res = yield request(app)
            .post('/api/v1/users/register')
            .type('json') 
            .expect(400)
            .end() 
        done()
    })
    it(protocol + ' users/register 409 user_existed', function*(done) {
        var userObj = yield MiniUser.getByName('Jerry')
        userObj.name.should.equal('Jerry')

        var res = yield request(app)
            .post('/api/v1/users/register')
            .type('json')
            .send({
                name: 'Jerry',
                password: '1a3c4s',
                nick: 'little Jerry',
                email: 'Jerry@minicloud.io'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('user_existed')
        done()
    })
    it(protocol + ' users/register 409 prohibit_registration', function*(done) {
        var Minioption = require('../../lib/model/option')
        var option = yield Minioption.create('user_register_enabled', '0')

        var res = yield request(app)
            .post('/api/v1/users/register')
            .type('json')
            .send({
                name: 'Diana',
                password: '1b9css',
                nick: 'little Diana',
                email: 'Diana@minicloud.io'
            })
            .expect(409)
            .end()
        res.body.error.should.equal('prohibit_registration')
        done()
    })
})
