'use strict'
var Sequelize = require('sequelize')
var path = require('path')
    /**
     * database connect.
     * Support MySQL & MariaDB/PostgreSQL/Amazon Redshift/SQLite/MongoDB
     * @param {Object} config 
     * @api public
     */
function SequelizeLoader(config) {
    this.config = config
    this.models = []
}
/**
 * Return database connect.
 *
 * connect database and init orm object for every database table
 * @param {Function} cb
 * @return {Object}
 * @api public
 */
SequelizeLoader.prototype.connect = function(cb) {
        var self = this
        var dbConfig = this.config
        dbConfig = dbConfig || {
            storage: path.resolve(process.cwd(), './minicloud.db'),
            dialect: 'sqlite'
        }
        dbConfig['table_prefix'] = dbConfig['table_prefix'] || 'minicloud_'
        dbConfig.pool = dbConfig.pool || {}
        dbConfig.pool['maxConnections'] = dbConfig.pool['max_connections'] || 5
        dbConfig.pool['maxIdleTime'] = dbConfig.pool['max_idle_time'] || 3000

        this.tablePrefix = dbConfig['table_prefix']
        global.tablePrefix = this.tablePrefix
        var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            storage: dbConfig.storage,
            pool: dbConfig.pool,
            logging: false
        })
        self.schema = require('../model/schema').getSchemas(this.tablePrefix)
        self.db = sequelize
            //user
        self._defineUserModel()
        self._defineUserPrivilegeModel()
        self._defineUserMetaModel()
            //device
        self._defineDeviceModel()
        self._defineOnlineDeviceModel()
            //group
        self._defineGroupModel()
        self._defineGroupPrivilegeModel()
        self._defineUserGroupRelationModel()
            //department
        self._defineDepartmentModel()
            //files
        self._defineFileModel()
        self._defineFileUploadSessionModel()
        self._defineFileMetaModel()
        self._defineLinkModel()
        self._defineVersionModel()
        self._defineVersionMetaModel()
            //tag
        self._defineTagModel()
        self._defineFileTagRelationModel()
            //event
        self._defineEventModel()
            //chooser
        self._defineChooserModel()
        self._defineChooserDomainModel()
        self._defineChooserLinkModel()
        self._defineChooserSelectFileModel()
            //doc
        self._defineDocNodeModel()
            //search            
        self._defineSearchNodeModel()
        self._defineSearchFileModel()
        self._defineSearchBuildTaskModel()
            //store
        self._defineStoreNodeModel()
            //other
        self._defineOptionModel()
        self._defineAppModel()
        self._defineTokenModel()
        self._defineRefreshTokenModel()
        self._defineCursorModel()

        cb(null, self)
    }
    /**
     * init table minicloud_users.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineUserModel = function() {
        var model = this._getModel('users')
        this.userModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_user_privileges.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineUserPrivilegeModel = function() {
        var model = this._getModel('user_privileges')
        this.userPrivilegeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_user_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineUserMetaModel = function() {

        var model = this._getModel('user_metas')
        this.userMetaModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_events.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineEventModel = function() {
        var model = this._getModel('events')
        this.eventModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_devices.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineDeviceModel = function() {

    var model = this._getModel('user_devices')
    this.deviceModel = model
    this.models.push(model)
}

/**
 * init table minicloud_online_devices.
 * 
 * @api private
 */
SequelizeLoader.prototype._defineOnlineDeviceModel = function() {
        var model = this._getModel('online_devices')
        this.onlineDeviceModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_groups.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineGroupModel = function() {
        var model = this._getModel('groups')
        this.groupModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_group_privileges.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineGroupPrivilegeModel = function() {
        var model = this._getModel('group_privileges')
        this.groupPrivilegeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_user_group_relations.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineUserGroupRelationModel = function() {
        var model = this._getModel('user_group_relations')
        this.userGroupRelationModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_departments.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineDepartmentModel = function() {

    var model = this._getModel('departments')
    this.departmentModel = model
    this.models.push(model)
}

/**
 * init table minicloud_files.
 * 
 * @api private
 */
SequelizeLoader.prototype._defineFileModel = function() {

        var model = this._getModel('files')
        this.fileModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_file_upload_sessions.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineFileUploadSessionModel = function() {
        var model = this._getModel('file_upload_sessions')
        this.fileUploadSessionModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_file_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineFileMetaModel = function() {

        var model = this._getModel('file_metas')
        this.fileMetaModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_links.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineLinkModel = function() {
    var model = this._getModel('file_links')
    this.linkModel = model
    this.models.push(model)
}

/**
 * init table minicloud_versions.
 * 
 * @api private
 */
SequelizeLoader.prototype._defineVersionModel = function() {
        var model = this._getModel('file_versions')
        this.versionModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_version_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineVersionMetaModel = function() {
        var model = this._getModel('file_version_metas')
        this.versionMetaModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_tag.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineTagModel = function() {
        var model = this._getModel('tags')
        this.tagModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_tag_file_relations.
     * 
     * @api private
     */

SequelizeLoader.prototype._defineFileTagRelationModel = function() {
    var model = this._getModel('file_tag_relations')
    this.fileTagRelationModel = model
    this.models.push(model)
}

/**
 * init table minicloud_choosers.
 * 
 * @api private
 */
SequelizeLoader.prototype._defineChooserModel = function() {

        var model = this._getModel('choosers')
        this.chooserModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_chooser_domains.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineChooserDomainModel = function() {
        var model = this._getModel('chooser_domains')
        this.chooserDomainModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_chooser_links.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineChooserLinkModel = function() {
        var model = this._getModel('chooser_links')
        this.chooserLinkModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_chooser_select_files.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineChooserSelectFileModel = function() {
    var model = this._getModel('chooser_select_files')
    this.chooserSelectFileModel = model
    this.models.push(model)
}

/**
 * init table minicloud_doc_nodes.
 * 
 * @api private
 */
SequelizeLoader.prototype._defineDocNodeModel = function() {

        var model = this._getModel('doc_nodes')
        this.docNodeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_search_nodes.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineSearchNodeModel = function() {

        var model = this._getModel('search_nodes')
        this.searchNodeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_search_files.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineSearchFileModel = function() {
        var model = this._getModel('search_files')
        this.searchFileModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_search_build_tasks.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineSearchBuildTaskModel = function() {
        var model = this._getModel('search_build_tasks')
        this.searchBuildTaskModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_store_nodes.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineStoreNodeModel = function() {
        var model = this._getModel('store_nodes')
        this.storeNodeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_options.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineOptionModel = function() {
        var model = this._getModel('options')
        this.optionModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_apps.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineAppModel = function() {
        var model = this._getModel('clients')
        this.appModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_oauth_access_tokens.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineTokenModel = function() {
        var model = this._getModel('oauth_access_tokens')
        this.tokenModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_oauth_refresh_tokens.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineRefreshTokenModel = function() {
        var model = this._getModel('oauth_refresh_tokens')
        this.refreshTokenModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_cursors.
     * 
     * @api private
     */
SequelizeLoader.prototype._defineCursorModel = function() {
        var model = this._getModel('cursors')
        this.cursorModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_cursors.
     * 
     * @api private
     */
SequelizeLoader.prototype._getModel = function(tableName) {
        var tableName = this.tablePrefix + tableName
        var tableSchema = this.schema[tableName]
        return this.db.define(tableName, tableSchema.columns, tableSchema.extend)
    }
    /**
     * Return database connect,support yield.
     *
     * @return {Object}
     * @api public
     */
module.exports = function(opts) {
    return function(done) {
        if (global.sequelizePool) {
            return done(null, global.sequelizePool)
        }
        var dbLoader = new SequelizeLoader(opts)
        dbLoader.connect(function(err, db) {
            return done(null, db)
        })
    }
}
