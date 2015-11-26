'use strict'
/**
 * database table minicloud_tag_file_relations CRUD
 */
var fileTagRelationModel = sequelizePool.fileTagRelationModel
    /**
     * Create tag-file relation
     * 
     * @param {Integer} tagId
     * @param {Integer} fileId
     * @return {Object}   
     * @api public
     */
exports.create = function*(tagId, fileId) {
    var relation = yield fileTagRelationModel.findOne({
        where: {
            tag_id: tagId,
            file_id: fileId
        }
    })
    if (!relation) {
        var relation = yield fileTagRelationModel.create({
            file_id: fileId,
            tag_id: tagId
        })
    }
    return relation
}

/**
 * judge  tag-file relation exist
 * @param {Integer} tagId
 * @param {Integer} fileId
 * @return [Boolean]   
 * @api public
 */
exports.exist = function*(tagId, fileId) {
        var count = yield fileTagRelationModel.count({
            where: {
                tag_id: tagId,
                file_id: fileId
            }
        })
        return count > 0
    }
    /**
     * get tag-file relation list by tagId
     * @param {Integer} tagId
     * @return [Array]   
     * @api public
     */
exports.getAllByTagId = function*(tagId) {
    return yield fileTagRelationModel.findAll({
        where: {
            tag_id: tagId
        }
    })
}

/**
 * remove file-tag relation 
 * @param {Integer} tagId
 * @param {Integer} fileId
 * @api public
 */
exports.remove = function*(tagId, fileId) {
        yield fileTagRelationModel.destroy({
            where: {
                tag_id: tagId,
                file_id: fileId
            }
        })
    }
    /**
     * remove all file-tag relation 
     * @param {Integer} tagId
     * @api public
     */
exports.removeAllByTagId = function*(tagId) {
        yield fileTagRelationModel.destroy({
            where: {
                tag_id: tagId
            }
        })
    }
    /**
     * get file-tag relation list by fileId
     * @param {Integer} fileId
     * @return [Array]   
     * @api public
     */
exports.getAllByFileId = function*(fileId) {
        return yield fileTagRelationModel.findAll({
            where: {
                file_id: fileId
            }
        })
    }
    /**
     * remove file tag relation by fileId
     * @param {integer} fileId
     * @api public
     */
exports.removeAllByFileId = function*(fileId) {
    yield fileTagRelationModel.destroy({
        where: {
            file_id: fileId
        }
    })
}
