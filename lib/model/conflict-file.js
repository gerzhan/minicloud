var MiniFileMeta = require('./file-meta')
var MiniVersion = require('./version')
    /**
     * Conflict file
     * option.mode add:It's always a conflict. The autorename strategy is to append a number to the file name. For example "document.txt" might become "document (2).txt". overwrite:It's never a conflict. Overwrite the existing file. The autorename strategy is the same as it is for add. update:It's a conflict only if the current "hash" doesn't match the given "hash". The autorename strategy is to append the string "conflicted copy" to the file name. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt".
     * @param {Integer} userId 
     * @param {Object} file 
     * @param {Object} version 
     * @param {Object} options  
     * @return {Object}    
     * @api public
     */
function ConflictFile(userId, file, version, options) {
    options = options || {}
    this.userId = userId
    this.file = file
    this.version = version
    this.mode = options.mode || 'overwrite'
    this.options = options
}
/**
 * By mode,Conflict file bisiness   
 * @return {Object}    
 * @api private
 */
ConflictFile.prototype.run = function*() {
        if (this.mode === 'add') {
            return yield this.add()
        }
        if (this.mode === 'overwrite') {
            return yield this.overwrite()
        }
        if (this.mode === 'update') {
            return yield this.update()
        }
    }
    /**
     * It's always a conflict. The autorename strategy is to append a number to the file name. For example "document.txt" might become "document (2).txt"  
     * @return {Object}    
     * @api private
     */
ConflictFile.prototype.add = function*() {
		console.log('TODO add')
    }
    /**
     * It's never a conflict. Overwrite the existing file. The autorename strategy is the same as it is for add.  
     * @return {Object}    
     * @api private
     */
ConflictFile.prototype.overwrite = function*() {
        var file = this.file
        var version = this.version
        var currentVersion = yield MiniVersion.getById(file.version_id)
        if (currentVersion) {
            //create history version
            var versionMeta = {
                hash: currentVersion.hash,
                device_id: this.options.device_id,
                time: new Date().getTime()
            }
            yield MiniFileMeta.addVersion(this.file.id, versionMeta)
                //set new version
            file.version_id = version.id
            file.size = version.size
            file = yield file.save()
        }
        return file
    }
    /**
     * It's a conflict only if the current "hash" doesn't match the given "hash". The autorename strategy is to append the string "conflicted copy" to the file name. For example, "document.txt" might become "document (conflicted copy).txt" or "document (Panda's conflicted copy).txt". 
     * @return {Object}    
     * @api public
     */
ConflictFile.prototype.update = function*() {
	console.log('TODO update')
}
exports.ConflictFile = ConflictFile
