'use strict'
/**
* 用户扩展属性表miniyun_user_metas相关查询、创建动作
*/
var usermetaModel = dbPool.usermetaModel;  
/**
* 创建meta记录，如存在记录，则进行更新
*/
exports.create = function *(userId,metaKey,metaValue){  
	var metaList = yield usermetaModel.coFind({user_id:userId,meta_key:metaKey});
	if(metaList.length==0){
		var usermeta = yield usermetaModel.coCreate({ 
			user_id:userId,
			meta_key:metaKey,
			meta_value:metaValue
		});
	}else{
		var usermeta = metaList[0];
		usermeta.meta_value = metaValue;
		usermeta = yield usermeta.coSave();
	}
	return usermeta;	
} 