/**
 * Module dependencies.
 */
var BizOption = require('../../../biz/biz-option')
var BizStoreNode = require('../../../biz/biz-store-node')
var MiniVersion = require('../../../model/version')
var MiniFileUploadSession = require('../../../model/file-upload-session')
var BizFile = require('../../../biz/biz-file')
var webHelpers = require('../../../web-helpers')
var fileHelpers = require('../../../file-helpers')

/**
 *Such as the use of minicloud-store, you need to call this interface to obtain the most efficient server for online minicloud storage node.default minicloud-storage off. 
 *@api public
 */
exports.uploadSessionStart = function*() {
        var device = this.request.device
        var userId = device.user_id
            //over space
        var isOver = yield BizFile.isOverSpace(userId, 0)
        if (isOver) {
            webHelpers.throw409(this, 'over_space', 'over space.')
            return
        }
        var plugins = yield BizOption.getPluginEnabledList()
        if (plugins.miniStore) {
            //The system has opened up a mini storage plug-in. The miniCloud will support distributed file storage, and the optimal storage node can be obtained by the following interface.
            var serverNode = yield BizStoreNode.getUploadBestNode()
            if (serverNode) {
                this.body = yield BizFile.createUploadSession(serverNode)
                return
            } else {
                webHelpers.throw409(this, 'no_valid_minicloud_storage_node', 'no valid minicloud storage node.')
                return
            }
        }
        var host = yield BizStoreNode.getDefaultHost(this)
        this.body = yield BizFile.createUploadSession({
            host: host,
            id: -1
        })

    }
    /**
     * By file content sha-256 code, If the code exists, create file meta,file upload successfully.
     * @api public
     */
exports.hashUpload = function*() {
        //check required fields
        this.checkBody('hash').notEmpty('missing required field.')
        this.checkBody('path').notEmpty('missing required field.')
        this.checkBody('mode').empty().in(['add', 'overwrite', 'update'], "not support mode.")
        var body = this.request.body
        var mode = body.mode || 'add'
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        //biz 
        var body = this.request.body
        var device = this.request.device
        var userId = device.user_id
        var hash = body.hash
        var path = body.path
        var version = yield MiniVersion.getByHash(hash)
        if (!version) {
            webHelpers.throw409(this, 'hash_not_existed', 'hash not exists,upload fail.')
            return
        }
        //over space
        var isOver = yield BizFile.isOverSpace(userId, version.size)
        if (isOver) {
            webHelpers.throw409(this, 'over_space', 'over space.')
            return
        }
        //hashUpload
        var file = yield BizFile.hashUpload(device, path, version, {
            mode: mode,
            parent_hash: body.parent_hash,
            client_modified: body.client_modified
        })
        this.filter = 'name,path_lower,client_modified,server_modified,hash,size'
        this.body = file
    }
    /**
     * file upload
     * @api public
     */
exports.finish = function*() {
    //check required fields
    this.checkBody('session_id').notEmpty('missing required field.')
    this.checkBody('hash').notEmpty('missing required field.')
    this.checkBody('path').notEmpty('missing required field.')
    this.checkBody('size').isInt('should integer.')
    this.checkBody('mode').empty().in(['add', 'overwrite', 'update'], "not support mode.")
    var body = this.request.body
    var mode = body.mode || 'add'
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    //biz 
    var body = this.request.body
    var device = this.request.device
    var userId = device.user_id
    var hash = body.hash
    var size = body.size
    var path = body.path
    var sessionId = body.session_id
        //check session
    var session = yield MiniFileUploadSession.getBySessionId(sessionId)
    if (!session) {
        webHelpers.throw409(this, 'session_id_not_exist', 'The session_id not exist.')
        return
    }
    //create version
    var version = yield MiniVersion.create(hash, size, {
            session: session,
            path: path,
            device: device
        })
        //hashUpload
    var file = yield BizFile.hashUpload(device, path, version, {
        mode: mode,
        parent_hash: body.parent_hash,
        client_modified: body.client_modified,
        ip: this.request.ip
    })
    this.filter = 'name,path_lower,client_modified,server_modified,hash,size'
    this.body = file
}
