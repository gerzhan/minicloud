'use strict'
/**
 * database table minicloud_oauth_access_tokens CRUD
 */
var tokenModel = sequelizePool.tokenModel
    /**
     * find token by bearerToken
     * @param {String} bearerToken 
     * @return {Object}
     * @api public
     */
exports.getToken = function*(bearerToken) {
        return yield tokenModel.findOne({
            where: {
                access_token: bearerToken
            }
        })
    }
    /**
     * create token
     * @param {Ineteger} deviceId 
     * @param {String} clientId
     * @param {String} accessToken
     * @param {Ineteger} expires
     * @return {Object}
     * @api public
     */
exports.create = function*(deviceId, clientId, accessToken, expires) {
        return yield tokenModel.create({
            device_id: deviceId,
            client_id: clientId,
            access_token: accessToken,
            expires: expires
        })
    }
    /**
     * Remove token
     * @param {String} clientId
     * @param {Integer} deviceId  
     * @api public
     */
exports.remove = function*(clientId, deviceId) {
    yield tokenModel.destroy({
        where: {
            client_id: clientId,
            device_id: deviceId
        }
    })
}
