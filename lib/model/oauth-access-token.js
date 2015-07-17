'use strict' 
/**
 * database table oauth-access-tokens CRUD
 */
 console.log("dbPool")
var tokenModel = dbPool.tokenModel
console.log(tokenModel) 
    /**
     * find token by bearerToken
     * @param {String} bearerToken 
     * @return {Object}
     * @api public
     */
exports.getToken = function *(bearerToken){ 
	var tokenList = yield tokenModel.coFind({access_token:bearerToken})
	if(tokenList.length==0){ 
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
exports.create = function *(userId,appKey,accessToken,expires){ 
	return yield tokenModel.coCreate({ 
		user_id:userId,
		client_id:appKey,
		access_token:accessToken,
		expires:expires
	})
} 
