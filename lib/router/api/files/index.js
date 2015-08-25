var MiniTag = require('../../../model/tag')
var MiniFileTagRelation = require('../../../model/file-tag-relation')
var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
var MiniVersion = require('../../../model/version')

Date.prototype.format = function(fmt) {
    var o = {
        //month 
        "M+": this.getMonth() + 1,
        //day 
        "d+": this.getDate(),
        //hour
        "h+": this.getHours(),
        //minite
        "m+": this.getMinutes(),
        //second 
        "s+": this.getSeconds(),
        //quarter 
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //millisecond 
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

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
    var file = yield MiniFile.createFolder(device, filePath)
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
        metadata.client_modified = (new Date(file.client_modified_at)).format("yyyy-MM-dd hh:mm:ss")
        metadata.server_modified = (new Date(file.updated_at)).format("yyyy-MM-dd hh:mm:ss")
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
