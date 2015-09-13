var request = require('co-supertest')
var context = require('../../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
var sequelize = require('sequelize')

describe(protocol + ' simplePage', function() {
    this.timeout(global.timeout) 
    var MiniUser=null
    var MiniUserMeta = null
    before(function*(done) {
        app = yield context.getApp()
        MiniUser = require('../../../lib/model/user')
        MiniUserMeta = require('../../../lib/model/user-meta')
        return done()
    })
    it(protocol + ' simplePage', function*(done) {
        var helpers = require('../../../lib/helpers')   
        var user = yield MiniUser.create('admin0', '123456') 
        yield MiniUserMeta.create(user.id,'nick', 'admin0') 
        user = yield MiniUser.create('admin1', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin1') 
        user = yield MiniUser.create('admin2', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin2')
        user = yield MiniUser.create('admin3', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin3')  
        user = yield MiniUser.create('admin4', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin4') 
        user = yield MiniUser.create('admin5', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin5') 
        user = yield MiniUser.create('admin6', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin6') 
        user = yield MiniUser.create('admin7', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin7') 
        user = yield MiniUser.create('admin8', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin8')
        user = yield MiniUser.create('admin9', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin9')  
        user = yield MiniUser.create('admin10', '123456')
        yield MiniUserMeta.create(user.id,'nick', 'admin10') 
        var conditons = {
            detail:{
                $like:'%a%'
            }
        } 
        var page1 = yield helpers.simplePage(global.sequelizePool.userModel,conditons,3,'','ID ASC')
        assert.equal(page1.items[0].name,'admin0')
        assert.equal(page1.items[1].name,'admin1')
        assert.equal(page1.items[2].name,'admin2')
        assert.equal(page1.items.length,3)
        assert.equal(page1.has_more,true) 
        assert.equal(page1.count,11) 

        var page1 = yield helpers.simplePage(global.sequelizePool.userModel,conditons,3,'abcd','ID ASC')
        assert.equal(page1.items[0].name,'admin0')
        assert.equal(page1.items[1].name,'admin1')
        assert.equal(page1.items[2].name,'admin2')
        assert.equal(page1.items.length,3)
        assert.equal(page1.has_more,true)
        var cursor1 = page1.cursor

        var page2 = yield helpers.simplePage(global.sequelizePool.userModel,conditons,3,cursor1,'ID ASC')
        assert.equal(page2.items[0].name,'admin3')
        assert.equal(page2.items[1].name,'admin4')
        assert.equal(page2.items[2].name,'admin5')
        assert.equal(page2.items.length,3)
        assert.equal(page2.has_more,true)
        var cursor2 = page2.cursor
        
        var page3 = yield helpers.simplePage(global.sequelizePool.userModel,conditons,3,cursor2,'ID ASC') 
        assert.equal(page3.items[0].name,'admin6')
        assert.equal(page3.items[1].name,'admin7')
        assert.equal(page3.items[2].name,'admin8')       
        assert.equal(page3.items.length,3)
        assert.equal(page3.has_more,true)
        var cursor3 = page3.cursor
        
        var page4 = yield helpers.simplePage(global.sequelizePool.userModel,conditons,3,cursor3,'ID ASC')
        assert.equal(page4.items[0].name,'admin9')
        assert.equal(page4.items[1].name,'admin10') 
        assert.equal(page4.items.length,2)
        assert.equal(page4.has_more,false) 

        done()
    }) 
})
