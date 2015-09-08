var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
    /**
     *download file
     * @api public
     */
exports.download = function*() {
        var body = this.request.query
            //check required fields
        this.checkQuery('path').notEmpty('missing required field.')
        if (this.errors) {
            webHelpers.throw400(this)
            return
        }
        var device = this.request.device
        var filePath = body.path
        var file = yield MiniFile.getByPath(device.user_id, filePath)
        if (!file) {
            webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
            return
        }
        var url = yield MiniFile.getDownload301Url(device, file)
        this.redirect(url)
    }
    /**
     *get file thumbnail
     * @api public
     */
exports.thumbnail = function*() {
    var body = this.request.query
    body.size = body.size || 'w256h256'
        //check required fields
    this.checkQuery('path').notEmpty('missing required field.')
    if (this.errors) {
        webHelpers.throw400(this)
        return
    }
    var device = this.request.device
    var filePath = body.path
    var file = yield MiniFile.getByPath(device.user_id, filePath)
    if (!file) {
        webHelpers.throw409(this, 'path_not_exist', 'path not exist.')
        return
    }
    var url = yield MiniFile.getThumbnail301Url(device, file, body.size)
    this.redirect(url)
}
