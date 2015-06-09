'use strict'
var miniUtil  = require("../lib/mini-util");
/**
* token表miniyun_tokens相关查询、创建动作
*/
var tokenModel = dbPool.tokenModel;  
/**
* 为nje类型创建部门
*/
exports.create = function *(clientId,deviceId){ 
	var tokenList = yield tokenModel.coFind({client_id:clientId,device_id:deviceId});
	if(tokenList.length==0){ 
		var token = yield tokenModel.coCreate({ 
			oauth_token:miniUtil.getRandomString(32),
			client_id:clientId,
			device_id:deviceId,
			expires:0,
			scope:""
		});
	}else{
		var token = tokenList[0]; 
	}
	return token;	
} 