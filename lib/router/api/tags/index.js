var MiniTag = require('../../../model/tag')
var MiniFileTagRelation = require('../../../model/file-tag-relation')
var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
    /**
     *add a tag
     * @api public
     */
exports.add = function*() {
        //check required fields
        this.checkBody('name').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var userId = this.request.user.id
        var body = this.request.body
        var name = body.name
        var existed = yield MiniTag.exist(userId, name)
        if (!existed) {
            var tag = yield MiniTag.create(userId, name)
            this.body = ''
        } else {
            webHelpers.throw409(this, 'tag_existed', 'tag has existed.')
        }
    }
    /**
     *get tag list
     * @api public
     */
exports.list = function*() {
        var userId = this.request.user.id
        var tagList = yield MiniTag.getAllByUserId(userId)
        this.filter = 'name'
        this.body = tagList
    }
    /**
     * add a tag to the file
     * @api public
     */
exports.addFile = function*() {
        //check required fields
        this.checkBody('name').notEmpty('missing required field.')
        this.checkBody('file_id').isInt('required number.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var userId = this.request.user.id
        var body = this.request.body
        var name = body.name
        var fileId = body.file_id
        var file = yield MiniFile.getById(fileId)
        if (!file) {
            webHelpers.throw409(this, 'file_not_exist', 'file not exist.')
            return
        }

        var tag = yield MiniTag.getByName(userId, name)
        if (tag) {
            var tagId = tag.id
            yield MiniFileTagRelation.create(tagId, fileId)
            this.body = ''
        } else {
            webHelpers.throw409(this, 'tag_not_exist', 'tag not exist.')
        }
    }
    /**
     *get files in current tag
     * @api public
     */
exports.getFileList = function*() {

    this.checkBody('name').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var userId = this.request.user.id
    var body = this.request.body
    var name = body.name

    var tag = yield MiniTag.getByName(userId, name)
    if (tag) {
        var tagId = tag.id
        var relationList = yield MiniFileTagRelation.getAllByTagId(tagId)

        var fileList = []
        for (var i = 0; i < relationList.length; i++) {
            var file = yield MiniFile.getById(relationList[i].file_id)
            fileList.push(file)
        }
        this.filter = 'id,name,path,file_created_at,file_updated_at'
        this.body = fileList
    } else {
        webHelpers.throw409(this, 'tag_not_exist', 'tag not exist.')
    }
}

/**
 *remove a file in current tag
 * @api public
 */
exports.removeFile = function*() {
    //check required fields
    this.checkBody('name').notEmpty('missing required field.')
    this.checkBody('file_id').isInt('required number.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var userId = this.request.user.id
    var body = this.request.body
    var name = body.name
    var fileId = body.file_id
    var file = yield MiniFile.getById(fileId)
    if (!file) {
        webHelpers.throw409(this, 'file_not_exist', 'file not exist.')
        return
    }
    var tag = yield MiniTag.getByName(userId, name)
    if (tag) {
        var tagId = tag.id
        yield MiniFileTagRelation.remove(tagId, fileId)
        this.body = ''
    } else {
        webHelpers.throw409(this, 'tag_not_exist', 'tag not exist.')
    }
}

/**
 *remove tag
 * @api public
 */
exports.remove = function*() {
    //check required fields
    this.checkBody('name').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var userId = this.request.user.id
    var body = this.request.body
    var name = body.name
    var tag = yield MiniTag.getByName(userId, name)
    if (tag) {
        yield tag.coRemove()
        this.body = ''
    } else {
        webHelpers.throw409(this, 'tag_not_exist', 'tag not exist.')
    }
}
