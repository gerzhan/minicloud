'use strict'
/**
 * database table minicloud_options CRUD
 */
var optionModel = dbPool.optionModel
    /**
     * create option
     * @param {String} key
     * @param {String} value
     * @return {Object}  
     * @api public
     */
exports.create = function*(key, value) {
        var optionList = yield optionModel.coFind({
            key: key
        })
        if (optionList.length == 0) {
            var user = yield optionModel.coCreate({
                key: key,
                value: value
            })
        } else {
            var option = optionList[0]
            option.value = value
            yield option.coSave();
        }
        return option
    }
    /**
     * get one option
     * @param {String} key
     * @return {Object}  
     * @api public
     */
exports.getByKey = function*(key) {
    var optionList = yield optionModel.coFind({
        key: key
    })
    if (optionList.length > 0) {
        return optionList[0]
    }
    return null

}
