'use strict' 
/**
* token表oauth_access_tokens相关查询、创建动作
*/
var tokenModel = dbPool.tokenModel;  
/**
* 查询token
*/
exports.getToken = function *(bearerToken){ 
	var tokenList = yield tokenModel.coFind({access_token:bearerToken});
	if(tokenList.length==0){ 
		return null
	}
	return tokenList[0]	
} 
/**
* 创建token
*/
exports.create = function *(userId,appKey,accessToken,expires){ 
	return yield tokenModel.coCreate({ 
		user_id:userId,
		client_id:appKey,
		access_token:accessToken,
		expires:expires
	})
} 
