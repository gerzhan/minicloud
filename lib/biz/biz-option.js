'use strict'
/**
 * plugin biz CRUD
 */
var MiniOption = require('../model/option')
    /**
     * return plugin enabled list
     * @return {Object}  
     * @api public
     */
exports.getPluginEnabledList = function*() {
        var option = yield MiniOption.getByKey('active_plugins')
        if (option) {
            return JSON.parse(option.value)
        }
        return {}
    }
    /**
     * return default space size 
     * @return BitInt  
     * @api public
     */
exports.getDefaultSpaceSize = function*() {
    var option = yield MiniOption.getByKey('site_default_space')
    var defaultSpaceSize = 10 * 1024 * 1024 * 1024
    if (option) {
        defaultSpaceSize = parseInt(option.value) * 1024 * 1024
    }
    return defaultSpaceSize
}
