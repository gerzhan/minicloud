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
        return
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
        return
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
        return
    }
}

    /**
     *rename tag
     * @api public
     */
exports.rename = function*() {
        //check required fields
        this.checkBody('old_name').notEmpty('missing required field.')
        this.checkBody('new_name').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz
        var userId = this.request.user.id
        var body = this.request.body
        var oldName = body.old_name
        var newName = body.new_name
        if (oldName === newName) {
            this.body = ''
        } else {
            var tag = yield MiniTag.getByName(userId, newName)
            if (tag) {
                webHelpers.throw409(this, 'new_tag_existed', 'new tag has existed.')
                return
            }
            tag = yield MiniTag.getByName(userId, oldName)
            if (!tag) {
                webHelpers.throw409(this, 'old_tag_not_exist', 'old tag not exist.')
                return
            }
            yield MiniTag.rename(userId, oldName, newName)
            this.body = ''
        }
    }
    /**
     *get tagss in current file
     * @api public
     */
exports.getTagList = function*() {
    this.checkBody('file_id').isInt('required number.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz
    var userId = this.request.user.id
    var body = this.request.body
    var fileId = body.file_id
    var file = yield MiniFile.getById(fileId)
    if (file) {
        // var tagId = tag.id
        var relationList = yield MiniFileTagRelation.getAllByFileId(fileId)
        var tagList = []
        for (var i = 0; i < relationList.length; i++) {
            var tag = yield MiniTag.getByTagId(userId, relationList[i].tag_id)
            tagList.push(tag)
        }
        this.filter = 'name'
        this.body = tagList
    } else {
        webHelpers.throw409(this, 'file_not_exist', 'file not exist.')
        return
    }
}