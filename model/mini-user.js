'use strict'
/**
* 用户表miniyun_users相关查询、创建动作
*/
var userModel = dbPool.userModel; 
var miniUtil  = require("../lib/mini-util");
/**
* 根据用户名获得数据库对象
*/
exports.getByName = function *(name){
	return yield userModel.coFind({user_name:name});
} 
/**
* 创建用户并且随机密码
*/
exports.createAndRandomPasswd = function *(name){ 
	//这里尚未对用户名进行拼音化
	var userList = yield userModel.coFind({user_name:name});
	if(userList.length==0){
		var user = yield userModel.coCreate({ 
			user_uuid:miniUtil.getRandomString(32),
			user_name:name,
			user_pass:miniUtil.getRandomString(32),
			user_status:1,
			salt:miniUtil.getRandomString(6),
			user_name_pinyin:name
		});
	}else{
		var user = userList[0];
	}
	return user;	
} 