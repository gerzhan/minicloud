var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' plugin.js', function() {
    this.timeout(10000)
    var app = null
    var MiniPlugin = null
    before(function*(done) {
        app = yield context.getApp()
        BizOption = require('../../lib/biz/biz-option')
        return done()
    })
    it(protocol + ' getPluginEnabledList', function*(done) {
        var plugins = yield BizOption.getPluginEnabledList()
        assert(plugins, {})
        done()
    })
    it(protocol + ' getPluginEnabledList', function*(done) {
        var MiniOption = require('../../lib/model/option')
        var plugins = {
            cqdx: {
                type: 'thirdUserSource',
                name: 'userSource'
            },
            miniSearch: {
                type: 'miniSearch',
                name: 'miniSearch'
            },
            miniStore: {
                type: 'miniStore',
                name: 'miniStore'
            },
            miniDoc: {
                type: 'miniDoc',
                name: 'miniDoc'
            }
        }
        yield MiniOption.create('active_plugins', JSON.stringify(plugins))
        var plugins = yield BizOption.getPluginEnabledList()
        var len = 0
        for (var key in plugins) {
            len++
        }
        assert(len, 6)
        done()
    })
})
