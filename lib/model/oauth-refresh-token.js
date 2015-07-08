'use strict'
/**
* token表oauth_refresh_tokens相关查询、创建动作
*/
var refreshTokenModel = dbPool.refreshTokenModel;  
/**
* 根据token查找对象
*/
exports.getRefreshToken = function *(bearerToken){ 
	var tokenList = yield refreshTokenModel.coFind({refresh_token:bearerToken});
	if(tokenList.length==0){ 
		return null
	}
	return tokenList[0]
} 
/**
* 创建token
*/
exports.create = function *(userId,appKey,refreshToken,expires){ 
	return yield refreshTokenModel.coCreate({ 
		user_id:userId,
		client_id:appKey,
		refresh_token:refreshToken,
		expires:expires
	})
} 
