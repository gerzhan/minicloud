/**
 * Module dependencies.
 */
var modelUser = require("../../../model/user")
var modelUserMeta = require("../../../model/user-meta")
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getCurrentAccount = function*() {
    var userId = this.request.user.id
    var user = yield modelUser.getById(userId) 
    var dbMetas = yield modelUserMeta.getAll(userId) 
    var metas = {} 
    for(var i=0;i<dbMetas.length;i++){
    	var item = dbMetas[i]  
    	metas[item.key] = item.value 
    } 
    this.body = {
    	name:user.name,
    	uuid:user.uuid,
    	metas:metas,
    	created_at:user.created_at,
    	updated_at:user.updated_at
    }
}
