    /**
     * database table minicloud_files CRUD
     */
    var fileModel = sequelizePool.fileModel

    function MiniFileDownload() {

    }
    /**
     * return download file 301 url
     * @param {Object} device 
     * @param {Object} file 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
    MiniFileDownload.prototype.getDownload301Url = function*(device, file, options) {
        return 'http://abc.com'
    }
    exports.MiniFileDownload = MiniFileDownload
