'use strict'
/**
* 设备表miniyun_user_devices相关查询、创建动作
*/
var userDeviceModel = dbPool.userDeviceModel; 
var miniUtil  = require("../lib/mini-util"); 
/**
* 创建网页版设备
*/
exports.createWebDevice = function *(userId,userName){ 
	var deviceType = 1;
	var deviceName = "web";
	var deviceInfo = userName+"web";
	var deviceList = yield userDeviceModel.coFind({user_id:userId,user_device_type:deviceType});
	if(deviceList.length==0){
		//网页版设备只有1个
		var webDeviceUUID = miniUtil.getDeviceUUID(userId,deviceType,deviceName,deviceInfo);	
		var device = yield userDeviceModel.coCreate({ 
			user_device_uuid:webDeviceUUID,
			user_id:userId,
			user_device_type:deviceType,
			user_device_name:deviceName,
			user_device_info:deviceInfo 
		});
	}else{
		var device = deviceList[0]; 
	}
	return device;
} 