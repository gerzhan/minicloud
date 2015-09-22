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

    var deviceModel = this.db.define(this.tablePrefix + 'user_devices', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        uuid: {
            type: Sequelize.STRING(32)
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        client_id: {
            type: Sequelize.STRING(64)
        },
        name: {
            type: Sequelize.STRING(255)
        },
        info: {
            type: Sequelize.STRING(255)
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8'
    })
    this.deviceModel = deviceModel
    this.models.push(deviceModel)
}

/**
 * init table minicloud_online_devices.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineOnlineDeviceModel = function() {
        var onlineDeviceModel = this.db.define(this.tablePrefix + 'online_devices', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            device_id: {
                type: Sequelize.INTEGER
            },
            client_id: {
                type: Sequelize.STRING(64)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.onlineDeviceModel = onlineDeviceModel
        this.models.push(onlineDeviceModel)
    }
    /**
     * init table minicloud_groups.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineGroupModel = function() {
        var groupModel = this.db.define(this.tablePrefix + 'groups', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(128)
            },
            description: {
                type: Sequelize.STRING(255)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.groupModel = groupModel
        this.models.push(groupModel)
    }
    /**
     * init table minicloud_group_privileges.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineGroupPrivilegeModel = function() {
        var groupPrivilegeModel = this.db.define(this.tablePrefix + 'group_privileges', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            group_id: {
                type: Sequelize.INTEGER
            },
            file_path: {
                type: Sequelize.STRING(255)
            },
            permission: {
                type: Sequelize.STRING(255)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.groupPrivilegeModel = groupPrivilegeModel
        this.models.push(groupPrivilegeModel)
    }
    /**
     * init table minicloud_user_group_relations.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserGroupRelationModel = function() {
        var userGroupRelationModel = this.db.define(this.tablePrefix + 'user_group_relations', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            group_id: {
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.userGroupRelationModel = userGroupRelationModel
        this.models.push(userGroupRelationModel)
    }
    /**
     * init table minicloud_departments.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineDepartmentModel = function() {
    var departmentModel = this.db.define(this.tablePrefix + 'departments', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(128)
        },
        description: {
            type: Sequelize.STRING(255)
        },
        path: {
            type: Sequelize.TEXT
        },
        parent_id: {
            type: Sequelize.INTEGER
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8'
    })
    this.departmentModel = departmentModel
    this.models.push(departmentModel)
}

/**
 * init table minicloud_files.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineFileModel = function() {
        var fileModel = this.db.define(this.tablePrefix + 'files', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.INTEGER
            },
            client_created: {
                type: Sequelize.BIGINT
            },
            client_modified: {
                type: Sequelize.BIGINT
            },
            name: {
                type: Sequelize.STRING(255)
            },
            version_id: {
                type: Sequelize.INTEGER
            },
            size: {
                type: Sequelize.BIGINT
            },
            path_lower: {
                type: Sequelize.STRING(640)
            },
            is_deleted: {
                type: Sequelize.BOOLEAN
            },
            mime: {
                type: Sequelize.STRING(128)
            },
            parent_id: {
                type: Sequelize.INTEGER
            },
            file_name_pinyin: {
                type: Sequelize.STRING(512)
            },
            server_modified: {
                field: 'updated_at',
                type: Sequelize.DATE
            }

        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.fileModel = fileModel
        this.models.push(fileModel)
    }
    /**
     * init table minicloud_file_upload_sessions.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineFileUploadSessionModel = function() {
        var fileUploadSessionModel = this.db.define(this.tablePrefix + 'file_upload_sessions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            session_id: {
                type: Sequelize.STRING(64)
            },
            store_node_id: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.fileUploadSessionModel = fileUploadSessionModel
        this.models.push(fileUploadSessionModel)
    }
    /**
     * init table minicloud_file_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineFileMetaModel = function() {
        var fileMetaModel = this.db.define(this.tablePrefix + 'file_metas', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            path: {
                type: Sequelize.STRING(640)
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
        this.fileMetaModel = fileMetaModel
        this.models.push(fileMetaModel)
    }
    /**
     * init table minicloud_links.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineLinkModel = function() {
    var linkModel = this.db.define(this.tablePrefix + 'share_files', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        key: {
            type: Sequelize.STRING(32)
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        file_id: {
            type: Sequelize.INTEGER
        },
        password: {
            type: Sequelize.STRING(8)
        },
        download_count: {
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
    this.linkModel = linkModel
    this.models.push(linkModel)
}

/**
 * init table minicloud_versions.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineVersionModel = function() {
        var versionModel = this.db.define(this.tablePrefix + 'file_versions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(64)
            },
            size: {
                type: Sequelize.BIGINT
            },
            ref_count: {
                type: Sequelize.INTEGER
            },
            mime: {
                type: Sequelize.STRING(64)
            },
            doc_convert_status: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            replicate_status: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.versionModel = versionModel
        this.models.push(versionModel)
    }
    /**
     * init table minicloud_version_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineVersionMetaModel = function() {
        var versionMetaModel = this.db.define(this.tablePrefix + 'file_version_metas', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            version_id: {
                type: Sequelize.INTEGER
            },
            key: {
                type: Sequelize.STRING(255)
            },
            value: {
                type: Sequelize.TEXT
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.versionMetaModel = versionMetaModel
        this.models.push(versionMetaModel)
    }
    /**
     * init table minicloud_tag.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineTagModel = function() {
        var tagModel = this.db.define(this.tablePrefix + 'tags', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(128)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.tagModel = tagModel
        this.models.push(tagModel)
    }
    /**
     * init table minicloud_tag_file_relations.
     * 
     * @api private
     */

SequelizeLoader.prototype.defineFileTagRelationModel = function() {
    var tableName = 'file_tag_relations'
    var fileTagRelationModel = this.db.define(this.tablePrefix + tableName, {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tag_id: {
            type: Sequelize.INTEGER
        },
        file_id: {
            type: Sequelize.INTEGER
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8'
    })
    this.fileTagRelationModel = fileTagRelationModel
    this.models.push(fileTagRelationModel)
}

/**
 * init table minicloud_choosers.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineChooserModel = function() {
        var chooserModel = this.db.define(this.tablePrefix + 'choosers', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(64)
            },
            app_key: {
                type: Sequelize.STRING(128)
            },
            type: {
                type: Sequelize.INTEGER
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.chooserModel = chooserModel
        this.models.push(chooserModel)
    }
    /**
     * init table minicloud_chooser_domains.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineChooserDomainModel = function() {
        var chooserDomainModel = this.db.define(this.tablePrefix + 'chooser_domains', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            chooser_id: {
                type: Sequelize.INTEGER
            },
            domain: {
                type: Sequelize.STRING(255)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.chooserDomainModel = chooserDomainModel
        this.models.push(chooserDomainModel)
    }
    /**
     * init table minicloud_chooser_links.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineChooserLinkModel = function() {
        var chooserLinkModel = this.db.define(this.tablePrefix + 'chooser_links', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            link_id: {
                type: Sequelize.INTEGER
            },
            app_key: {
                type: Sequelize.STRING(32)
            },
            session: {
                type: Sequelize.STRING(32)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
        this.chooserLinkModel = chooserLinkModel
        this.models.push(chooserLinkModel)
    }
    /**
     * init table minicloud_chooser_select_files.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineChooserSelectFileModel = function() {
    var chooserSelectFileModel = this.db.define(this.tablePrefix + 'chooser_select_files', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        file_key: {
            type: Sequelize.STRING(64)
        },
        file_ids: {
            type: Sequelize.STRING(255)
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        charset: 'utf8'
    })
    this.chooserSelectFileModel = chooserSelectFileModel
    this.models.push(chooserSelectFileModel)
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
