'use strict'
/**
 * database table miniyun_apps CRUD
 */
var appModel = dbPool.appModel
    /**
     * Return app
     * @param {String} clientId
     * @param {String} clientSecret 
     * @return {Object}    
     * @api public
     */
exports.getApp = function*(clientId, clientSecret) {
        var appList = yield appModel.coFind({
            client_id: clientId,
            secret: clientSecret,
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
     * @param {String} clientId 
     * @param {String} clientSecret 
     * @param {String} redirectUri
     * @param {Boolean} enabled
     * @param {String} description
     * @return {Object}    
     * @api public
     */
exports.create = function*(userId, clientName, clientId, clientSecret, redirectUri, enabled, description) {
    var appList = yield appModel.coFind({
        client_id: clientId,
        secret: clientSecret,
    })
    if (appList.length == 0) {
        var app = yield appModel.coCreate({
            user_id: userId,
            name: clientName,
            client_id: clientId,
            secret: clientSecret,
            redirect_uri: redirectUri,
            enabled: enabled,
            description: description
        })
    } else {
        var app = appList[0]
        app.user_id = userId
        app.name = clientName
        app.redirect_uri = redirectUri
        app.enabled = enabled
        app.description = description
        app = yield app.coSave()
    }
    return app
}
