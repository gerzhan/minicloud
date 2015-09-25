'use strict'
/**
 * database table minicloud_apps CRUD
 */
var appModel = sequelizePool.appModel
    /**
     * Return app
     * @param {String} clientId
     * @param {String} clientSecret 
     * @return {Object}    
     * @api public
     */
exports.getApp = function*(clientId, clientSecret) { 
        return yield appModel.findOne({
            where: {
                client_id: clientId,
                secret: clientSecret,
                enabled: 1
            }
        })
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
    var app = yield appModel.findOne({
        where: {
            client_id: clientId,
            secret: clientSecret
        }
    })
    if (!app) {
        app = yield appModel.create({
            user_id: userId,
            name: clientName,
            client_id: clientId,
            secret: clientSecret,
            redirect_uri: redirectUri,
            enabled: enabled,
            description: description
        })
    } else {
        app.user_id = userId
        app.name = clientName
        app.redirect_uri = redirectUri
        app.enabled = enabled
        app.description = description
        app = yield app.save()
    }
    return app
}
