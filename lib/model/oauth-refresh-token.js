'use strict'
/**
 * database table oauth-refresh-tokens CRUD
 */
var refreshTokenModel = dbPool.refreshTokenModel
    /**
     * find refresh token by bearerToken
     * @param {String} bearerToken 
     * @return {Object}
     * @api public
     */
exports.getRefreshToken = function*(bearerToken) {
        var tokenList = yield refreshTokenModel.coFind({
            refresh_token: bearerToken
        })
        if (tokenList.length == 0) {
            return null
        }
        return tokenList[0]
    }
    /**
     * create refresh token
     * @param {Integer} userId 
     * @param {String} appKey 
     * @param {String} refreshToken 
     * @param {Integer} expires
     * @return {Object}
     * @api public
     */
exports.create = function*(userId, appKey, refreshToken, expires) {
    return yield refreshTokenModel.coCreate({
        user_id: userId,
        client_id: appKey,
        refresh_token: refreshToken,
        expires: expires
    })
}
