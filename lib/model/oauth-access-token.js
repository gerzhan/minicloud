'use strict'
/**
 * database table oauth-access-tokens CRUD
 */
var tokenModel = dbPool.tokenModel
    /**
     * find token by bearerToken
     * @param {String} bearerToken 
     * @return {Object}
     * @api public
     */
exports.getToken = function*(bearerToken) {
        var tokenList = yield tokenModel.coFind({
            access_token: bearerToken
        })
        if (tokenList.length == 0) {
            return null
        }
        return tokenList[0]
    }
    /**
     * create token
     * @param {Ineteger} userId 
     * @param {String} appKey
     * @param {String} accessToken
     * @param {Ineteger} expires
     * @return {Object}
     * @api public
     */
exports.create = function*(userId, appKey, accessToken, expires) {
        return yield tokenModel.coCreate({
            user_id: userId,
            client_id: appKey,
            access_token: accessToken,
            expires: expires
        })
    }
    /**
     * Remove token
     * @param {String} clientId
     * @param {Integer} userId  
     * @api public
     */
exports.remove = function*(clientId, userId) {
        yield tokenModel.find({
            client_id: clientId,
            user_id: userId
        }).remove().coRun()
    }
    /**
     * get token
     * @param {String} clientId
     * @param {Integer} userId  
     * @return {Object}
     * @api public
     */
exports.getAccessToken = function*(clientId, userId) {
    var accessTokenList = yield tokenModel.coFind({
        client_id: clientId,
        user_id: userId
    })
    if (accessTokenList.length > 0) {
        return accessTokenList[0]
    }
    return null
}
