/**
 * Module dependencies.
 */
var webHelpers = require('../web-helpers')
    /**
     * 404 page
     * request accept 'application/json' render json error info,otherwise render 404 page
     * @param {Object} opts 
     * @api public
     */
module.exports = function(opts) {
    return function* errorPage(next) {
        yield * next
        if (this.status === 404) {
            if (this.request.method === 'GET' && !this.request.is('application/json')) {
                var url = webHelpers.createUrl(this, '/site/error', {})
                this.redirect(url)
            }
        }
    }
}
