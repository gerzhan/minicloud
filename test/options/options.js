var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL

describe(protocol + ' options', function() {
    this.timeout(10000)
    var app = null
    var MiniOption = null
    var user = null
    before(function*(done) {
        app = yield context.getApp()
        MiniOption = require('../../lib/model/option')
        return done()
    })
    it(protocol + ' option.js/create', function*(done) {
        var option = yield MiniOption.create('site_id', '123')
        var option1 = yield MiniOption.create('site_id', '234')
        var option2 = yield MiniOption.getByKey('site_id') 
        option2.value.should.equal('234')
        option2.id.should.equal(option.id)
        done()
    })
    it(protocol + ' helpers.js/getDeviceTypeByClientId', function*(done) {
        var helpers = require('../../lib/helpers')
        var deviceType =  helpers.getDeviceTypeByClientId('d6n6Hy8CtSFEVqNh')
        deviceType.should.equal(2)
        deviceType =  helpers.getDeviceTypeByClientId('c9Sxzc47pnmavzfy')
        deviceType.should.equal(3) 
        deviceType =  helpers.getDeviceTypeByClientId('MsUEu69sHtcDDeCp')
        deviceType.should.equal(4) 
        deviceType =  helpers.getDeviceTypeByClientId('V8G9svK8VDzezLum')
        deviceType.should.equal(5) 
        deviceType =  helpers.getDeviceTypeByClientId('Lt7hPcA6nuX38FY4')
        deviceType.should.equal(6)
        done()
    })
    
})
