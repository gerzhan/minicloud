'use strict'
/**
 * database table minicloud_options CRUD
 */
var optionModel = sequelizePool.optionModel
    /**
     * create option
     * @param {String} key
     * @param {String} value
     * @return {Object}  
     * @api public
     */
exports.create = function*(key, value) {
        var option = yield optionModel.findOne({
            where: {
                key: key
            }
        })
        if (!option) {
            option = yield optionModel.create({
                key: key,
                value: value
            })
        } else {
            option.value = value
            option = yield option.save()
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
    return yield optionModel.findOne({
        where: {
            key: key
        }
    })
}
