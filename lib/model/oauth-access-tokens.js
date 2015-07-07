'use strict' 
/**
* token表oauth_refresh_tokens相关查询、创建动作
*/
var tokenModel = dbPool.tokenModel;  
/**
* 创建token
*/
exports.getToken = function *(bearerToken){ 
	var tokenList = yield tokenModel.coFind({access_token:bearerToken});
	if(tokenList.length==0){ 
		return null
	}else{
		var token = tokenList[0]; 
	}
	return token;	
} 

