'use strict'
/**
 * database table miniyun_clients CRUD
 */ 
var clientModel = dbPool.clientModel
/**
 * Return app
 * @param {String} appKey
 * @param {String} appSecret 
 * @return {Object}    
 * @api public
 */
exports.getApp = function*(appKey, appSecret) {
    var appList = yield clientModel.coFind({
        client_id: appKey,
        client_secret: appSecret,
        enabled: 1
    })
    if (appList.length == 0) {
        return null
    }
    return appList[0]
}
