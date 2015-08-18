'use strict'
var php = require('phpjs')
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
        return php.unserialize(option.value)
    }
    return {}
}

