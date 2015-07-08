'use strict'
/**
* db table miniyun_user_metas related query/create
*/
var usermetaModel = dbPool.usermetaModel
var MiniUtil = require('../mini-util')
/**
* create meta record，if existed then update
*/
exports.create = function *(userId,metaKey,metaValue){  
	var metaList = yield usermetaModel.coFind({user_id:userId,meta_key:metaKey})
	if(metaList.length==0){
		var usermeta = yield usermetaModel.coCreate({ 
			user_id:userId,
			meta_key:metaKey,
			meta_value:metaValue
		})
	}else{
		var usermeta = metaList[0]
		usermeta.meta_value = metaValue
		usermeta = yield usermeta.coSave()
	}
	return usermeta
} 
/**
* get attributes of the user
*/
exports.getMetas = function *(userId){  
	var metaList = yield usermetaModel.coFind({user_id:userId})
	if(metaList.length>0){
		return metaList
	}
	return null	
} 
/**
*To determine whether the user is locked
*/
exports.isLocked = function *(userId){

	var metaList = yield usermetaModel.coFind({user_id:userId,meta_key:"password_error_count"})
	if(metaList.length>0){
		var meta = metaList[0]		
		//more than 15 minutes,password_error_count set 0
		var end = new Date()
		var start = meta.updated_at
		var diff = MiniUtil.timeDiff(start,end)

		if(diff>1000*60*15){
			meta.meta_value = "0"
			meta = yield meta.coSave()
		}
		var passwordErrorCount = parseInt(meta.meta_value)
		if(passwordErrorCount>4){
			return true
		}
	}
	return false
}
/**
*record number of errors
*/
exports.updatePasswordErrorTimes = function *(userId){
	var metaKey = "password_error_count"
	var metaList = yield usermetaModel.coFind({user_id:userId,meta_key:metaKey}) 
	if(metaList.length>0){
		var meta = metaList[0]
		var errorCount = parseInt(meta.meta_value)+1
		meta.meta_value = errorCount.toString()
		meta = yield meta.coSave() 
		return meta
	}else{ 
		var meta = yield usermetaModel.coCreate({ 
			user_id:userId,
			meta_key:metaKey,
			meta_value:"1"
		}) 
		return meta
	}
}
/**
*reset password number of errors
*/
exports.resetPasswordErrorTimes = function *(userId){
	var metaKey = "password_error_count"
	var metaList = yield usermetaModel.coFind({user_id:userId,meta_key:metaKey}) 
	if(metaList.length>0){
		var meta = metaList[0] 
		meta.meta_value = "0"
		meta = yield meta.coSave() 
		return meta
	}else{ 
		var meta = yield usermetaModel.coCreate({ 
			user_id:userId,
			meta_key:metaKey,
			meta_value:"0"
		}) 
		return meta
	}
}