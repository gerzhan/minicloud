'use strict'
/**
 * Module dependencies.
 */
var md5 = require('md5')
    /**
     * create a random string
     * @param {Integer} length
     * @return {String}
     * @api public
     */
exports.getRandomString = function(length) {
        var len = length || 32
        var x = "0123456789qwertyuiopasdfghjklzxcvbnm"
        var tmp = ""
        for (var i = 0; i < len; i++) {
            tmp += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
        }
        return tmp
    }
    /**
     * return User device UUID
     * @param {Integer} userId
     * @param {String} deviceType
     * @param {String} deviceName
     * @param {String} deviceInfo
     * @return {String}
     * @api public
     */
exports.getDeviceUUID = function(userId, deviceType, deviceName, deviceInfo) {
        var str = userId + "_" + deviceType + "_" + deviceInfo + "_" + deviceName + "_RGeavfnK8GMjBjDQ"
        return md5(str)
    }
    /**
     * Encryption Password  
     * @param {String} text
     * @param {String} salt 
     * @return {String}
     * @api public
     */
exports.encryptionPasswd = function(text, salt) {
        var temp1 = md5(text) + salt
        var ciphertext = md5(temp1)
        return ciphertext
    }
    /**
     * old version 
     * clientId->deviceTypeId
     * @param {String} clientId 
     * @return {String}
     * @api public
     */
exports.getDeviceTypeByClientId = function(clientId) {
        var deviceType = 1
        if (clientId == "d6n6Hy8CtSFEVqNh") {
            deviceType = 2
        }
        if (clientId == "c9Sxzc47pnmavzfy") {
            deviceType = 3
        }
        if (clientId == "MsUEu69sHtcDDeCp") {
            deviceType = 4
        }
        if (clientId == "V8G9svK8VDzezLum") {
            deviceType = 5
        }
        if (clientId == "Lt7hPcA6nuX38FY4") {
            deviceType = 6
        }
        return deviceType
    }
    /**
     * Get two time difference, the return value ms 
     * @param {String} text
     * @param {String} salt 
     * @return {String}
     * @api public
     */ 
exports.timeDiff = function(start, end) {
    var startTime = start.getTime()
    var endTime = end.getTime()
    return endTime - startTime
}
