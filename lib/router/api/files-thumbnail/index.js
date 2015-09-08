var webHelpers = require('../../../web-helpers')
var MiniFile = require('../../../model/file')
    /**
     *get file thumbnail
     * @api public
     */
exports.thumbnail = function*() {
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
    body.size = body.size || 'w256h256'
    var device = this.request.device
    var filePath = body.path
    var file = yield MiniFile.getByPath(device.user_id, filePath)
    if (!file || file.type !== 0) {
        webHelpers.throw409(this, 'file_not_exist', 'file not existed or it\'s folder.')
        return
    }
    var url = yield MiniFile.getThumbnail301Url(device, file, body.size)
    this.redirect(url)
}
