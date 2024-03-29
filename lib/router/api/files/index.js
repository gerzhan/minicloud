var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
var MiniFileMeta = require('../../../model/file-meta')
var MiniVersion = require('../../../model/version')
    /**
     *list folder
     * @api public
     */
exports.listFolder = function*() {
        var body = this.request.body
        body.path = body.path || PATH_SEP
        body.cursor = body.cursor || ''
        body.limit = body.limit || 100
            //check required fields
        this.checkBody('limit').isInt('required number.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        var device = this.request.device
        var filePath = body.path
        var file = null
        if (filePath !== PATH_SEP) {
            file = yield MiniFile.getByPath(device.user_id, filePath)
            if (!file) {
                webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
                return
            }
        }
        var conditions = {}
        var parentId = -1
        if (file) {
            parentId = file.id
        }
        conditions = {
            user_id: device.user_id,
            parent_id: parentId
        }
        var files = yield MiniFile.listFolder(conditions, body.cursor, body.limit)
        this.body = files
    }
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
    this.body = yield MiniFile.getFullFile(file)
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
        this.body = yield MiniFile.getFullFile(file)
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
        this.body = yield MiniFile.getFullFile(toFile)
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
        this.body = yield MiniFile.getFullFile(toFile)
    }
    /**
     *get all revisions of a file
     * @api public
     */
exports.listRevision = function*() {
        this.checkBody('path').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        var device = this.request.device
        var userId = device.user_id
        var body = this.request.body
        var path = body.path
        var file = yield MiniFile.getByPath(userId, path)
        if (!file) {
            webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
            return
        }
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        this.body = revs
    }
    /**
     *Restore a file to a specific revision
     * @api public
     */
exports.restore = function*() {
    this.checkBody('path').notEmpty('missing required field.')
    this.checkBody('hash').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var device = this.request.device
    var userId = device.user_id
    var body = this.request.body
    var path = body.path
    var hash = body.hash
    var file = yield MiniFile.getByPath(userId, path)
    if (!file) {
        webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
        return
    }
    var revs = yield MiniFileMeta.getRevs(file.path_lower)
    var existed = false
    for (var i = 0; i < revs.length; i++) {
        if (revs[i].hash === hash) {
            var existed = true
        }
    }
    var version = yield MiniVersion.getByHash(hash)
    if (!version || !existed) {
        webHelpers.throw409(this, 'hash_not_exist', 'hash not exist.')
        return
    }
    //update version
    yield MiniFile.updateVersion(device, file, version, {
        ip: this.request.ip
    })
    this.body = ''
}
