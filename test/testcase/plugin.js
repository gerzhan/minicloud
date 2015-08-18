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
        BizPlugin = require('../../lib/biz/biz-plugin') 
        return done()
    })
    it(protocol + ' getPluginEnabledList', function*(done) {
        var plugins = yield BizPlugin.getPluginEnabledList() 
        assert(plugins,{})
        done()
    }) 
    it(protocol + ' getPluginEnabledList', function*(done) {
        var MiniOption = require('../../lib/model/option') 
        yield MiniOption.create('active_plugins','a:6:{s:4:"cqdx";a:2:{s:4:"type";s:15:"thirdUserSource";s:4:"name";s:21:"重庆党校用户源";}s:10:"miniSearch";a:2:{s:4:"type";s:10:"miniSearch";s:4:"name";s:12:"迷你搜索";}s:9:"miniStore";a:2:{s:4:"type";s:9:"miniStore";s:4:"name";s:12:"迷你存储";}s:7:"miniDoc";a:2:{s:4:"type";s:7:"miniDoc";s:4:"name";s:12:"迷你文档";}s:13:"businessTheme";a:2:{s:4:"type";s:13:"businessTheme";s:4:"name";s:15:"商业版主题";}i:0;b:0;}')
        var plugins = yield BizPlugin.getPluginEnabledList()
        var len=0
        for( var key in plugins ) {
            len++
        }
        assert(len,6)
        done()
    })      
})
