'use strict'
/**
 * database table minicloud_tag_file_relations CRUD
 */
var fileTagRelationModel = dbPool.fileTagRelationModel
    /**
     * Create tag-file relation
     * 
     * @param {Integer} tagId
     * @param {Integer} fileId
     * @return {Object}   
     * @api public
     */
exports.create = function*(tagId, fileId) {
    var relationList = yield fileTagRelationModel.coFind({
        tag_id: tagId,
        file_id: fileId
    })
    if (relationList.length == 0) {
        var relation = yield fileTagRelationModel.coCreate({
            file_id: fileId,
            tag_id: tagId
        })
    } else {
        var relation = relationList[0]
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
    var relationList = yield fileTagRelationModel.coFind({
        tag_id: tagId,
        file_id: fileId
    })
    return relationList.length > 0
}
    /**
     * get tag-file relation list by tagId
     * @param {Integer} tagId
     * @return [Array]   
     * @api public
     */
exports.getAllByTagId = function*(tagId) {
        var relationList = yield fileTagRelationModel.coFind({
            tag_id: tagId
        })
        return relationList
    }

     /**
     * remove file-tag relation 
     * @param {Integer} tagId
     * @param {Integer} fileId
     * @api public
     */
exports.remove = function*(tagId, fileId) {
        yield fileTagRelationModel.find({
            tag_id: tagId,
            file_id: fileId
        }).remove().coRun()
    }
   /**
     * remove all file-tag relation 
     * @param {Integer} tagId
     * @api public
     */
exports.removeAllByTagId = function*(tagId) {
    yield fileTagRelationModel.find({
        tag_id: tagId
    }).remove().coRun()
}