'use strict'
var S = require('string')
/**
* 用户表miniyun_users相关查询、创建动作
*/
var userModel = dbPool.userModel
var pinyin    = require("pinyin")
var miniUtil  = require("../mini-util")
/**
* 根据用户名获得数据库对象
*/
exports.getByName = function *(name){
	return yield userModel.coFind({user_name:name})
} 
/**
* 根据用户Id获得数据库对象
*/
exports.getById = function *(id){
	return yield userModel.coFind({id:id})
} 
/**
* 验证用户名与密码是否匹配
*/
exports.valid = function *(name,passwd){
	var user = yield userModel.coFind({user_name:name})
	if(user){
		return true
	}
	return false
}
/**
* 创建用户并且随机密码
*/
exports.createAndRandomPasswd = function *(name,nick){ 
	var quanPin = pinyin(nick, {style: pinyin.STYLE_NORMAL});
	var jianPin = pinyin(nick, {style: pinyin.STYLE_FIRST_LETTER});
	var pinyinStr = S(quanPin).replaceAll(",","").s+"|"+S(jianPin).replaceAll(",","").s;
	var userList = yield userModel.coFind({user_name:name});
	if(userList.length==0){
		var user = yield userModel.coCreate({ 
			user_uuid:miniUtil.getRandomString(32),
			user_name:name,
			user_pass:miniUtil.getRandomString(32),
			user_status:1,
			salt:miniUtil.getRandomString(6),
			user_name_pinyin:pinyinStr
		});
	}else{
		var user = userList[0];
		user.user_name_pinyin = pinyinStr;
		yield user.coSave();
	}
	return user;	
} 