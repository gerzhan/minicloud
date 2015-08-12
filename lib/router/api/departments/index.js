var MiniDepartment = require('../../../model/department')
var MiniUserDepartmentRelation = require('../../../model/user-department-relation')
var MiniUser = require('../../../model/user')
var webHelpers = require('../../../web-helpers')
/**
 * add a department
 * @api public
 */
exports.add = function*() {
    var body = this.request.body
    body.parent_id =  body.parent_id || -1
    //check required fields
    this.checkBody('parent_id').isInt('required number.')
    this.checkBody('name').notEmpty('missing required field.') 
    if (this.errors) { 
        webHelpers.throw400(this)
        return
    }

    var name = body.name
    var parentId = body.parent_id
    //biz
    var existed = yield MiniDepartment.exist(parentId, name)
    if (!existed) {
        yield MiniDepartment.create(parentId, name)
        this.body = ''
    } else {
        webHelpers.throw409(this, 'department_existed', 'department has existed.')
    }
}

/**
 * remove a department
 * @api public
 */
exports.remove = function*() {
    var body = this.request.body
    //check required fields
    this.checkBody('id').isInt('required number.')
    if (this.errors) { 
        webHelpers.throw400(this)
        return
    }
    var id = body.id
    var department = yield MiniDepartment.getById(id)
    if(!department){
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    }else{
        var relationList = yield MiniUserDepartmentRelation.getAllByDepartmentId(id)
        if(relationList.length == 0){//没有与部门相关联的用户才能删除)
            yield MiniDepartment.remove(id)
            this.body = ''
        }else{
           webHelpers.throw409(this, 'department_remains_users', 'Department remains users.')
        }
    }
}

/**
 * rename a department
 * @api public
 */
exports.rename = function*() {
    var body = this.request.body
    //check required fields
    this.checkBody('id').isInt('required number.')
    this.checkBody('new_name').notEmpty('missing required field.')
    if (this.errors) { 
        webHelpers.throw400(this)
        return
    }
    var id = body.id
    var newName = body.new_name
    var department = yield MiniDepartment.getById(id)
    if(!department){
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    }else{
        var parentId = department.parent_group_id
        var exist = yield MiniDepartment.exist(parentId,newName)
        if(department.name == newName){
            exist = false;
        }
        if(!exist){
            yield MiniDepartment.rename(id,newName)
            this.body = ''
        }else{
            webHelpers.throw409(this, 'new_name_existed', 'new name existed.')
        }
    }
}

/**
 * get department members
 * @api public
 */
exports.members = function*() {
    var body = this.request.body
    body.id =  body.id
    //check required fields
    this.checkBody('id').isInt('required number.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var id = body.id
    var department = yield MiniDepartment.getById(id)
    if(!department){
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    }else{
        var relationList = yield MiniUserDepartmentRelation.getAllByDepartmentId(id)
        var memberList = []
        for(var i=0;i<relationList.length;i++){
            var arr = {}
            memberId = relationList[i].user_id
            var user = yield MiniUser.getById(memberId) 
            memberList.push(user)
        }
        //todo filter
        this.filter = 'name,uuid,metas,created_at,updated_at'
        this.body = memberList
    }
}

/**
 * department add member
 * @api public
 */
exports.membersAdd = function*() {
    var body = this.request.body
    body.id =  body.id
    body.uuid =  body.uuid
    //check required fields
    this.checkBody('id').isInt('required number.')
    this.checkBody('uuid').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var id   = body.id
    var uuid = body.uuid
    var department = yield MiniDepartment.getById(id)
    if(!department){
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    }else{
        var member = yield MiniUser.getByUuid(uuid)
        if(member == null){
            webHelpers.throw409(this, 'member_not_exist', 'member not exist')
        }else{
            yield MiniUserDepartmentRelation.create(id,member.id)
            this.body = ''
        }
    }
}

/**
 * department remove member
 * @api public
 */
exports.membersRemove = function*() {
    var body = this.request.body
    body.id =  body.id
    body.uuid =  body.uuid
    //check required fields
    this.checkBody('id').isInt('required number.')
    this.checkBody('uuid').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var id   = body.id
    var uuid = body.uuid
    var department = yield MiniDepartment.getById(id)
    if(!department){
        webHelpers.throw409(this, 'department_not_exist', 'department not exist')
    }else{
        var member = yield MiniUser.getByUuid(uuid)
        if(member == null){
            webHelpers.throw409(this, 'member_not_exist', 'member not exist')
        }else{
            yield MiniUserDepartmentRelation.remove(id,member.id)
            this.body = ''
        }
    }
}