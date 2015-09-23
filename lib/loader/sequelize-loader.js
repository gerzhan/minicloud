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
        self.defineUserModel()
        self.defineUserPrivilegeModel()
        self.defineUserMetaModel()
            //device
        self.defineDeviceModel()
        self.defineOnlineDeviceModel()
            //group
        self.defineGroupModel()
        self.defineGroupPrivilegeModel()
        self.defineUserGroupRelationModel()
            //department
        self.defineDepartmentModel()
            //files
        self.defineFileModel()
        self.defineFileUploadSessionModel()
        self.defineFileMetaModel()
        self.defineLinkModel()
        self.defineVersionModel()
        self.defineVersionMetaModel()
            //tag
        self.defineTagModel()
        self.defineFileTagRelationModel()
            //event
        self.defineEventModel()
            //chooser
        self.defineChooserModel()
        self.defineChooserDomainModel()
        self.defineChooserLinkModel()
        self.defineChooserSelectFileModel()
            //doc
        self.defineDocNodeModel()
            //search            
        self.defineSearchNodeModel()
        self.defineSearchFileModel()
        self.defineSearchBuildTaskModel()
            //store
        self.defineStoreNodeModel()
        self.defineStoreBreakFileModel()
        self.defineStoreReplicateTaskModel()
            //other
        self.defineOptionModel()
        self.defineAppModel()
        self.defineTokenModel()
        self.defineRefreshTokenModel()
        self.defineCursorModel()

        cb(null, self)
    }
    /**
     * init table minicloud_users.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserModel = function() {
        var tableName = this.tablePrefix + 'users'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)
        this.userModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_user_privileges.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserPrivilegeModel = function() {
        var tableName = this.tablePrefix + 'user_privileges'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)
        this.userPrivilegeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_user_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserMetaModel = function() {

        var tableName = this.tablePrefix + 'user_metas'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)
        this.userMetaModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_events.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineEventModel = function() {
        var tableName = this.tablePrefix + 'events'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)
        this.eventModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_devices.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineDeviceModel = function() {

    var tableName = this.tablePrefix + 'user_devices'
    var tableSchema = this.schema[tableName]
    var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

    this.deviceModel = model
    this.models.push(model)
}

/**
 * init table minicloud_online_devices.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineOnlineDeviceModel = function() {
        var tableName = this.tablePrefix + 'online_devices'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)
        this.onlineDeviceModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_groups.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineGroupModel = function() {
        var tableName = this.tablePrefix + 'groups'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)
        this.groupModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_group_privileges.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineGroupPrivilegeModel = function() {
        var tableName = this.tablePrefix + 'group_privileges'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.groupPrivilegeModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_user_group_relations.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserGroupRelationModel = function() {

        var tableName = this.tablePrefix + 'user_group_relations'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.userGroupRelationModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_departments.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineDepartmentModel = function() {

    var tableName = this.tablePrefix + 'departments'
    var tableSchema = this.schema[tableName]
    var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

    this.departmentModel = model
    this.models.push(model)
}

/**
 * init table minicloud_files.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineFileModel = function() {

        var tableName = this.tablePrefix + 'files'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.fileModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_file_upload_sessions.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineFileUploadSessionModel = function() {

        var tableName = this.tablePrefix + 'file_upload_sessions'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.fileUploadSessionModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_file_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineFileMetaModel = function() {

        var tableName = this.tablePrefix + 'file_metas'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.fileMetaModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_links.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineLinkModel = function() {
    var tableName = this.tablePrefix + 'file_links'
    var tableSchema = this.schema[tableName]
    var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

    this.linkModel = model
    this.models.push(model)
}

/**
 * init table minicloud_versions.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineVersionModel = function() {

        var tableName = this.tablePrefix + 'file_versions'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.versionModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_version_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineVersionMetaModel = function() {

        var tableName = this.tablePrefix + 'file_version_metas'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.versionMetaModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_tag.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineTagModel = function() {

        var tableName = this.tablePrefix + 'tags'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.tagModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_tag_file_relations.
     * 
     * @api private
     */

SequelizeLoader.prototype.defineFileTagRelationModel = function() {

    var tableName = this.tablePrefix + 'file_tag_relations'
    var tableSchema = this.schema[tableName]
    var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

    this.fileTagRelationModel = model
    this.models.push(model)
}

/**
 * init table minicloud_choosers.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineChooserModel = function() {

        var tableName = this.tablePrefix + 'choosers'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.chooserModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_chooser_domains.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineChooserDomainModel = function() {
        var tableName = this.tablePrefix + 'chooser_domains'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.chooserDomainModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_chooser_links.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineChooserLinkModel = function() {

        var tableName = this.tablePrefix + 'chooser_links'
        var tableSchema = this.schema[tableName]
        var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

        this.chooserLinkModel = model
        this.models.push(model)
    }
    /**
     * init table minicloud_chooser_select_files.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineChooserSelectFileModel = function() {
    var tableName = this.tablePrefix + 'chooser_select_files'
    var tableSchema = this.schema[tableName]
    var model = this.db.define(tableName, tableSchema.columns, tableSchema.extend)

    this.chooserSelectFileModel = model
    this.models.push(model)
}

/**
 * init table minicloud_doc_nodes.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineDocNodeModel = function() {
        var docNodeModel = this.db.define(this.tablePrefix + 'doc_nodes', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            host: {
                type: Sequelize.STRING(128)
            },
            safe_code: {
                type: Sequelize.STRING(128)
            },
            status: {
                type: Sequelize.INTEGER
            },
            converted_file_count: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.docNodeModel = docNodeModel
        this.models.push(docNodeModel)
    }
    /**
     * init table minicloud_search_nodes.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineSearchNodeModel = function() {
        var searchNodeModel = this.db.define(this.tablePrefix + 'search_nodes', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            host: {
                type: Sequelize.STRING(128)
            },
            safe_code: {
                type: Sequelize.STRING(128)
            },
            status: {
                type: Sequelize.INTEGER
            },
            build_file_count: {
                type: Sequelize.INTEGER
            },
            search_count: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.searchNodeModel = searchNodeModel
        this.models.push(searchNodeModel)
    }
    /**
     * init table minicloud_search_files.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineSearchFileModel = function() {
        var searchFileModel = this.db.define(this.tablePrefix + 'search_files', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(64)
            },
            node_ids: {
                type: Sequelize.STRING(128)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.searchFileModel = searchFileModel
        this.models.push(searchFileModel)
    }
    /**
     * init table minicloud_search_build_tasks.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineSearchBuildTaskModel = function() {
        var searchBuildTaskModel = this.db.define(this.tablePrefix + 'search_build_tasks', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(64)
            },
            node_id: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.searchBuildTaskModel = searchBuildTaskModel
        this.models.push(searchBuildTaskModel)
    }
    /**
     * init table minicloud_store_nodes.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineStoreNodeModel = function() {
        var storeNodeModel = this.db.define(this.tablePrefix + 'store_nodes', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            host: {
                type: Sequelize.STRING(128)
            },
            safe_code: {
                type: Sequelize.STRING(128)
            },
            status: {
                type: Sequelize.BOOLEAN
            },
            saved_file_count: {
                type: Sequelize.INTEGER
            },
            downloaded_file_count: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.storeNodeModel = storeNodeModel
        this.models.push(storeNodeModel)
    }
    /**
     * init table minicloud_store_nodes.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineStoreBreakFileModel = function() {
        var storeBreakFileModel = this.db.define(this.tablePrefix + 'store_break_files', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(128)
            },
            node_id: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.storeBreakFileModel = storeBreakFileModel
        this.models.push(storeBreakFileModel)
    }
    /**
     * init table minicloud_store_replicate_tasks.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineStoreReplicateTaskModel = function() {
        var storeReplicateTaskModel = this.db.define(this.tablePrefix + 'store_replcate_tasks', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(128)
            },
            node_id: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.storeReplicateTaskModel = storeReplicateTaskModel
        this.models.push(storeReplicateTaskModel)
    }
    /**
     * init table minicloud_options.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineOptionModel = function() {
        var optionModel = this.db.define(this.tablePrefix + 'options', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            key: {
                type: Sequelize.STRING(64)
            },
            value: {
                type: Sequelize.TEXT
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.optionModel = optionModel
        this.models.push(optionModel)
    }
    /**
     * init table minicloud_apps.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineAppModel = function() {
        var appModel = this.db.define(this.tablePrefix + 'clients', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(255)
            },
            client_id: {
                type: Sequelize.STRING(32)
            },
            secret: {
                type: Sequelize.STRING(64)
            },
            redirect_uri: {
                type: Sequelize.STRING(255)
            },
            enabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            description: {
                type: Sequelize.STRING(255)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.appModel = appModel
        this.models.push(appModel)
    }
    /**
     * init table minicloud_oauth_access_tokens.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineTokenModel = function() {
        var tokenModel = this.db.define(this.tablePrefix + 'oauth_access_tokens', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            access_token: {
                type: Sequelize.STRING(128)
            },
            client_id: {
                type: Sequelize.STRING(128)
            },
            device_id: {
                type: Sequelize.INTEGER
            },
            expires: {
                type: Sequelize.BIGINT
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.tokenModel = tokenModel
        this.models.push(tokenModel)
    }
    /**
     * init table minicloud_oauth_refresh_tokens.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineRefreshTokenModel = function() {
        var refreshTokenModel = this.db.define(this.tablePrefix + 'oauth_refresh_tokens', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            refresh_token: {
                type: Sequelize.STRING(128)
            },
            client_id: {
                type: Sequelize.STRING(128)
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            expires: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.refreshTokenModel = refreshTokenModel
        this.models.push(refreshTokenModel)
    }
    /**
     * init table minicloud_cursors.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineCursorModel = function() {
        var cursorModel = this.db.define(this.tablePrefix + 'cursors', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            cursor: {
                type: Sequelize.STRING(64)
            },
            value: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.cursorModel = cursorModel
        this.models.push(cursorModel)
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
