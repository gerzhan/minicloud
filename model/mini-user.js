'use strict'
var userModel = dbPool.userModel; 
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
	return yield userModel.coCreate({user_name:name,});
} 