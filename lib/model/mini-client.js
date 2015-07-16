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
    /**
     * Create app
     * @param {Integer} userId, system app userId=-1
     * @param {String} clientName 
     * @param {String} appKey 
     * @param {String} appSecret 
     * @param {String} redirectUri
     * @param {Boolean} enabled
     * @param {String} description
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, clientName, appKey, appSecret, redirectUri, enabled, description) {
    var appList = yield clientModel.coFind({
        client_id: appKey,
        client_secret: appSecret,
    })
    if (appList.length == 0) {
        var app = yield clientModel.coCreate({
            user_id: userId,
            client_name: clientName,
            client_id: appKey,
            client_secret:appSecret,
            redirect_uri:redirectUri,
            enabled:enabled,
            description:description
        })
    } else {
        var app = appList[0]
        app.user_id = userId
        app.client_name = clientName
        app.redirect_uri = redirectUri
        app.enabled = enabled
        app.description = description
        app = yield app.coSave()
    }
    return app
}
