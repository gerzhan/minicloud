var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' member add', function() {
    var app = null
    var MiniUser = null
    var MiniUserMeta = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        MiniUser = require('../../lib/model/user')
        MiniUserMeta = require('../../lib/model/user-meta')
        user = yield MiniUser.create('Adolph', '1a3c4s')
        var metaNick = yield MiniUserMeta.create(user.id, 'nick', 'littleAdolph')
        var metaEmail = yield MiniUserMeta.create(user.id, 'email', 'Adolph@minicloud.io')
        return done()
    })
    it(protocol + ' should add a member', function*(done) {
        var res = yield request(app)
            .post('/api/v1/members/add')
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
        metaList[0].value.should.equal('littleAllen')
        metaList[1].value.should.equal('Allen@minicloud.io')
        done()
    })
    it(protocol + ' should return 409', function*(done) {
        var userObj = yield MiniUser.getByName('Adolph')
        userObj.name.should.equal('Adolph')

        var res = yield request(app)
            .post('/api/v1/members/add')
            .type('json')
            .send({
                name: 'Adolph',
                password: '1a3c4s',
                nick: 'little Adolph',
                email: 'Adolph@minicloud.io'
            })
            .expect(409)
            .end()
        res.body.error_description.should.equal('member has existed.')
        done()
    })
    it(protocol + ' should prohibit registered users', function*(done) {
        var Minioption = require('../../lib/model/option')
        var option = yield Minioption.create('user_register_enabled', '0')

        var res = yield request(app)
            .post('/api/v1/members/add')
            .type('json')
            .send({
                name: 'Diana',
                password: '1b9css',
                nick: 'little Diana',
                email: 'Diana@minicloud.io'
            })
            .expect(409)
            .end()
        res.body.error_description.should.equal('Prohibit registered users.')
        done()
    })
})
