'use strict'
/**
* 群组/部门表miniyun_groups相关查询、创建动作
*/
var groupModel = dbPool.groupModel;  
/**
* 为nje类型创建部门
*/
exports.create4Nje = function *(name,description){ 
	var groupList = yield groupModel.coFind({description:description});
	if(groupList.length==0){
		var group = yield groupModel.coCreate({ 
			name:name,
			description:description,
			user_id:-1,
			parent_group_id:-1
		});
	}else{
		var group = groupList[0];
		group.name = name;
		group = yield group.coSave();
	}
	return group;	
} 