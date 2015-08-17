'use strict'
var php = require('phpjs')
    /**
     * database table minicloud_options CRUD
     */
var optionModel = sequelizePool.optionModel
    /**
     * return plugin enabled list
     * @return {Object}  
     * @api public
     */
exports.getEnabledList = function*() {
    var option = yield optionModel.findOne({
        where: {
            key: 'active_plugins'
        }
    })
    if (option) {
        return php.unserialize(option.value)
    }
    return {}
}
