var MiniTag = require('../../../model/tag')
var MiniFileTagRelation = require('../../../model/file-tag-relation')
var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
var MiniVersion = require('../../../model/version')

/**
 *create a folder
 * @api public
 */
exports.createFolder = function*() {
    this.checkBody('path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var device = this.request.device
    var body = this.request.body
    var filePath = body.path
    var file = yield MiniFile.createFolder(device, filePath, {
        ip: this.request.ip
    })
    this.filter = 'name,path_lower'
    this.body = file
    return
}

/**
 *get metadata
 * @api public
 */
exports.getMetadata = function*() {
        this.checkBody('path').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }

        var device = this.request.device
        var userId = device.user_id
        var body = this.request.body
        var filePath = body.path
        var file = yield MiniFile.getByPath(userId, filePath)
        if (!file) {
            webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
            return
        }
        var tags = new Array()
        var metadata = {}
            //return file metadata
        if (file.type === 0) {
            var version = yield MiniVersion.getById(file.version_id)
                //get taglist by file
            var relationList = yield MiniFileTagRelation.getAllByFileId(file.id)
            metadata.tag = 'file'
            if (relationList.length > 0) {
                for (var i = 0; i < relationList.length; i++) {
                    var tag = yield MiniTag.getByTagId(userId, relationList[i].tag_id)
                    tags[i] = tag.name
                }
                metadata.tag = metadata.tag + ',' + tags.join(',')
            }
            metadata.name = file.name
            metadata.path_lower = file.path_lower
            metadata.client_modified = new Date(file.client_modified)
            metadata.server_modified = file.updated_at
            metadata.hash = version.hash
            metadata.size = version.size
            this.body = metadata
            return
        }
        //return folder metadata
        if (file.type === 1) {
            var relationList = yield MiniFileTagRelation.getAllByFileId(file.id)
            metadata.tag = 'folder'
            if (relationList.length > 0) {
                for (var i = 0; i < relationList.length; i++) {
                    var tag = yield MiniTag.getByTagId(userId, relationList[i].tag_id)
                    tags[i] = tag.name
                }
                metadata.tag = metadata.tag + ',' + tags.join(',')
            }
            metadata.name = file.name
            metadata.path_lower = file.path_lower
            this.body = metadata
            return
        }
    }
    /**
     *delete file or folder
     * @api public
     */
exports.delete = function*() {
    this.checkBody('path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var filePath = body.path
    if (Object.prototype.toString.call(filePath) === '[object Array]') {
        for (var i = 0; i < filePath.length; i++) {
            var file = yield MiniFile.getByPath(userId, filePath[i])
            if (!file) {
                webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
                return
            }
            yield MiniFile.fakeDeleteFile(device, filePath[i], {
                ip: this.request.ip,
                path: filePath[i]
            })
        }
    }
    if (Object.prototype.toString.call(filePath) === '[object String]') {
        var file = yield MiniFile.getByPath(userId, filePath)
        if (!file) {
            webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
            return
        }
        yield MiniFile.fakeDeleteFile(device, filePath, {
            ip: this.request.ip,
            path: filePath
        })
    }
    this.body = ''
}

/**
 *copy file or folder
 * @api public
 */
exports.copy = function*() {
        this.checkBody('from_path').notEmpty('missing required field.')
        this.checkBody('to_path').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        var device = this.request.device
        var userId = device.user_id
        var body = this.request.body
        var fromPath = body.from_path
        var toPath = body.to_path
        var file = yield MiniFile.getByPath(userId, fromPath)
        if (!file) {
            webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
            return
        }
        var metadata = {}
        var toFile = yield MiniFile.copy(device, fromPath, toPath, {
            ip: this.request.ip
        })
        if (toFile.type === 0) {
            var version = yield MiniVersion.getById(toFile.version_id)
            metadata.name = toFile.name
            metadata.path_lower = toFile.path_lower
            metadata.client_modified = new Date(toFile.client_modified)
            metadata.server_modified = toFile.updated_at
            metadata.hash = version.hash
            metadata.size = version.size
        }
        if (toFile.type === 1) {
            metadata.name = toFile.name
            metadata.path_lower = toFile.path_lower
        }
        this.body = metadata
    }
    /**
     *move file or folder
     * @api public
     */
exports.move = function*() {
    this.checkBody('from_path').notEmpty('missing required field.')
    this.checkBody('to_path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var fromPath = body.from_path
    var toPath = body.to_path
    var file = yield MiniFile.getByPath(userId, fromPath)
    if (!file) {
        webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
        return
    }
    var metadata = {}
    var tags = new Array()
    var toFile = yield MiniFile.move(device, fromPath, toPath, {
        ip: this.request.ip
    })
    if (toFile.type === 0) {
        var version = yield MiniVersion.getById(toFile.version_id)
        var relationList = yield MiniFileTagRelation.getAllByFileId(toFile.id)
        metadata.tag = 'file'
        if (relationList.length > 0) {
            for (var i = 0; i < relationList.length; i++) {
                var tag = yield MiniTag.getByTagId(userId, relationList[i].tag_id)
                tags[i] = tag.name
            }
            metadata.tag = metadata.tag + ',' + tags.join(',')
        }
        metadata.name = toFile.name
        metadata.path_lower = toFile.path_lower
        metadata.client_modified = new Date(toFile.client_modified)
        metadata.server_modified = toFile.updated_at
        metadata.hash = version.hash
        metadata.size = version.size
        this.body = metadata
        return
    }
    if (toFile.type === 1) {
        var relationList = yield MiniFileTagRelation.getAllByFileId(toFile.id)
        metadata.tag = 'folder'
        if (relationList.length > 0) {
            for (var i = 0; i < relationList.length; i++) {
                var tag = yield MiniTag.getByTagId(userId, relationList[i].tag_id)
                tags[i] = tag.name
            }
            metadata.tag = metadata.tag + ',' + tags.join(',')
        }
        metadata.name = toFile.name
        metadata.path_lower = toFile.path_lower
        this.body = metadata
        return
    }
}
