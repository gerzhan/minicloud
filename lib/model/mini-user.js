'use strict'
var S = require('string')
/**
 * database table miniyun_users CRUD
 */
var userModel = dbPool.userModel
var userMetaModel = dbPool.userMetaModel 
var miniUtil  = require("../mini-util") 
    /**
     * find user by name
     * @param {String} name 
     * @return {Object}
     * @api public
     */
exports.getByName = function *(name){
	var userList =  yield userModel.coFind({user_name:name})
	if(userList.length>0){
		return userList[0]
	}
	return null
} 
    /**
     * find user by id
     * @param {Integer} id 
     * @return {Object}
     * @api public
     */
exports.getById = function *(id){
	var userList =  yield userModel.coFind({id:id})
	if(userList.length>0){
		return userList[0]
	}
	return null
} 