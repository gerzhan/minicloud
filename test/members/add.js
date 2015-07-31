var assert = require("assert")
var request = require("supertest")
var co = require('co')
var context = require("../context")
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' member add', function() {
    var app = null
    before(function(done) {
        co.wrap(function*() {
            app = yield context.getApp()
            var modelUser = require("../../lib/model/user")
            var modelUserMeta = require("../../lib/model/user-meta")
            var user = yield modelUser.create('lisi', '1a3c4s')
            var metaNick = yield modelUserMeta.create(user.id, "nick", 'xiaoli')
            var metaEmail = yield modelUserMeta.create(user.id, "email", 'lisi@miniyun.com')
            return done()
        })()
    })
    it(protocol + ' should add a member', function(done) {
        request(app)
            .post('/api/v1/members/add')
            .type('json')
            .send({
                name: "zhangsan",
                password: "8k9v6n",
                nick: "xiaozhang",
                email: "zhangsan@miniyun.com"
            })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err)
                done()
            })
    })
    it(protocol + ' should return 409', function(done) {
        request(app)
            .post('/api/v1/members/add')
            .type('json')
            .send({
                name: "lisi",
                password: "1a3c4s",
                nick: "xiaoli",
                email: "lisi@miniyun.com"
            })
            .expect(409)
            .end(function(err, res) {
                if (err) return done(err)
                done()
            })
    })
})
