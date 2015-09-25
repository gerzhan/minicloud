var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
var MiniFileMeta = require('../../../model/file-meta')
var MiniFileVersion = require('../../../model/version')
var BizStoreNode = require('../../../biz/biz-store-node')
    /**
     *download file
     * @api public
     */
exports.download = function*() {
    var body = null
        //check required fields
    if (this.method === 'GET') {
        body = this.request.query
        this.checkQuery('path').notEmpty('missing required field.')
    } else {
        body = this.request.body
        this.checkBody('path').notEmpty('missing required field.')
    }
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var device = this.request.device
    var filePath = body.path
    var file = yield MiniFile.getByPath(device.user_id, filePath)
    if (!file || file.type !== 0) {
        webHelpers.throw409(this, 'file_not_exist', 'file not existed or it\'s folder.')
        return
    }
    var version = null
    var revHash = body.rev_hash
    if (revHash) {
        var revs = yield MiniFileMeta.getRevs(file.path_lower)
        for (var i = 0; i < revs.length; i++) {
            var rev = revs[i]
            if (rev.hash === revHash) {
                version = yield MiniFileVersion.getByHash(revHash)
            }
        }
        if (!version) {
            webHelpers.throw409(this, 'rev_hash_not_exist', 'rev hash not exist.')
            return
        }
    } else {
        version = yield MiniFileVersion.getById(file.version_id)
    }
    var defaultHost = yield BizStoreNode.getDefaultHost(this)
    var onlineView = body.online_view || 0
    var url = yield MiniFile.getDownload301Url(device, file, version, onlineView, defaultHost)
    if (body.websocket) {
        this.body = {content_url:url}
    } else {
        this.redirect(url)
    }
}
