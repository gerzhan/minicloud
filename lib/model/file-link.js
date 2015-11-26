    /**
     * database table minicloud_file_links CRUD
     */
    var fileLinkModel = sequelizePool.fileLinkModel
        /**
         * remove file links by fileId
         * @param {integer} fileId
         * @api public
         */
    exports.removeAllByFileId = function*(fileId) {
        yield fileLinkModel.destroy({
            where: {
                file_id: fileId
            }
        })
    }
