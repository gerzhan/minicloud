'use strict'
/**
* 群组/部门表miniyun_user_group_relation相关查询、创建动作
*/
var userGroupRelationModel = dbPool.userGroupRelationModel;  
/**
* 创建用户与部门的关系
*/
exports.create = function *(groupId,userId){ 
	 var relationList = yield userGroupRelationModel.coFind({user_id:userId});
	if(relationList.length==0){
		var relation = yield userGroupRelationModel.coCreate({ 
			user_id:userId,
			group_id:groupId
		});
	}else{
		var relation = relationList[0];
		relation.group_id = groupId;
		relation = yield relation.coSave();
	}
	return relation;
} 