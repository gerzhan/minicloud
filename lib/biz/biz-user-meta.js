'use strict'
/**
 * user-meta biz
 */
var MiniUserMeta = require('../model/user-meta')
var BizOption = require('./biz-option')
    /**
     * return current user space size
     * @param {Integer} userId
     * @return BitInt  
     * @api public
     */
exports.getSpaceSize = function*(userId) {
    var meta = yield MiniUserMeta.getByKey(userId,'space')
    if(meta){
    	return parseInt(meta.value)*1024*1024
    }    
    return yield BizOption.getDefaultSpaceSize()
}
