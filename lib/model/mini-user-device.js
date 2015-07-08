'use strict'
/**
 * 设备表miniyun_user_devices相关查询、创建动作
 */
var userDeviceModel = dbPool.userDeviceModel
var miniUtil = require("../mini-util")
var md5 = require('MD5')
/**
 * 创建设备，如设备存在，修改最后修改时间并返回
 * @param user 用户对象miniUser
 * @param deviceName 设备名称
 * @appKey appKey
 */
exports.create = function *(user,deviceName,appKey) {

    var deviceType = 1
    if (appKey == "d6n6Hy8CtSFEVqNh") {
        deviceType = 2
    }
    if (appKey == "c9Sxzc47pnmavzfy") {
        deviceType = 3
    }
    if (appKey == "MsUEu69sHtcDDeCp") {
        deviceType = 4
    }
    if (appKey == "V8G9svK8VDzezLum") {
        deviceType = 5
    }
    if (appKey == "Lt7hPcA6nuX38FY4") {
        deviceType = 6
    }  
    //设备信息
    var deivceInfo = appKey + "_" + user.user_name + "_" + deviceName 
    //设备的UUID是根据deviceInfo生成
    var deviceUuid = md5(deivceInfo) 
    var deviceList = yield userDeviceModel.coFind({user_device_uuid:deviceUuid})
    if(deviceList.length==0){ 
		var device = yield userDeviceModel.coCreate({ 
			user_id:user.id,
			user_device_type:deviceType,
			user_device_name:deviceName,
			user_device_info:deivceInfo,
			user_device_uuid:deviceUuid
		})
	}else{
		//更新时间
		var device = deviceList[0]
		device = yield device.coSave()
	}
    return device
}
