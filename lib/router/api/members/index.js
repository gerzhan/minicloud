/**
 * Module dependencies.
 */
var modelUser = require("../../../model/user")
var modelUserMeta = require("../../../model/user-meta")
    /**
     *According access_token, return the user details
     * @api public
     */
exports.getMyAccount = function*() { 
    var userId = this.request.user.id
    var user = yield modelUser.getById(userId)
    var dbMetas = yield modelUserMeta.getAll(userId)
    var metas = {}
    for (var i = 0; i < dbMetas.length; i++) {
        var item = dbMetas[i]
        metas[item.key] = item.value
    }
    if (!metas.avatar) {
        metas.avatar = "/assets/default-avatar.png"
    }
    this.body = {
        name: user.name,
        uuid: user.uuid,
        metas: metas,
        created_at: user.created_at,
        updated_at: user.updated_at
    }
}
    /**
     *return the users list
     * @api public
     */
exports.getList = function*() { 
    var memberModelList = yield modelUser.getList()
    var memberList = []
    for (var i = 0; i < memberModelList.length; i++) {
        var member = {}
        var memberId = memberModelList[i].id
        var memberMeta = yield modelUserMeta.getAll(memberId)
        member['name'] = memberModelList[i].name
        for(var j = 0;j<memberMeta.length;j++){
            if(memberMeta[j].key=="nick"){
                member["nick"] = memberMeta[j].value
            }
            if(memberMeta[j].key=="phone"){
                member["phone"] = memberMeta[j].value
            }
            if(memberMeta[j].key=="email"){
                member["email"] = memberMeta[j].value
            }
            if(memberMeta[j].key=="space"){
                member["space"] = memberMeta[j].value
            }
            if(memberMeta[j].key=="is_admin"){
                member["is_admin"] = (memberMeta[j].value==="1"?true:false)
            }
            if(memberMeta[j].key=="file_sort_type"){
                member["file_sort_type"] = memberMeta[j].value
            }
            if(memberMeta[j].key=="file_sort_order"){
                member["file_sort_order"] = memberMeta[j].value
            }
        }
        memberList.push(member)
    }
    this.body = memberList
}

exports.search = function*() {
    key = "admin"
    var certainMemberModelList = yield modelUser.search(key)
    this.body = certainMemberModelList
}