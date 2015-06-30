'use strict'
var md5 = require('MD5');
/**
 * 获得随机字符串
 */
exports.getRandomString = function(length) {
		var len = length | 32;
		var x = "0123456789qwertyuiopasdfghjklzxcvbnm";
		var tmp = "";
		for (var i = 0; i < len; i++) {
			tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
		}
		return tmp;
	}
	/**
	 * 获得用户设备UUID
	 */
exports.getDeviceUUID = function(userId, deviceType, deviceName, deviceInfo) {
		var str = userId + "_" + deviceType + "_" + deviceInfo + "_" + deviceName + "_RGeavfnK8GMjBjDQ";
		return md5(str);
	}
	/**
	 * 对密码加密
	 */
exports.encryptionPasswd = function(text, salt) {
	var temp1 = md5(text) + salt
	var ciphertext = md5(temp1)
	return ciphertext
}