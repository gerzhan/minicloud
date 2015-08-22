var request = require('co-supertest')
var context = require('../context')
var protocol = process.env.ORM_PROTOCOL
var assert = require('assert')
describe(protocol + ' helpers.js', function() {
    this.timeout(10000) 

    it(protocol + ' getDeviceTypeByClientId', function*(done) {
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
