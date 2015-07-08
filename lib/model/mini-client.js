'use strict'
var S = require('string');
/**
* 用户表miniyun_clients相关查询、创建动作
*/
var clientModel = dbPool.clientModel;   
/**
* 根据appKey+appSecret查询APP对象
*/
exports.getApp = function *(appKey,appSecret){ 
	var appList = yield clientModel.coFind({client_id:appKey,client_secret:appSecret,enabled:1});
	if(appList.length==0){ 
		return null
	}
	return appList[0]
} 