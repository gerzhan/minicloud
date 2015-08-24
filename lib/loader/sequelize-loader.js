'use strict'
var Sequelize = require('sequelize')
    /**
     * database connect.
     * Support MySQL & MariaDB/PostgreSQL/Amazon Redshift/SQLite/MongoDB
     * @param {Object} config 
     * @api public
     */
function SequelizeLoader(config) {
    this.config = config
    this.oldVersion = config.version < 3
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
        var opts = this.config
        var env = process.env.NODE_ENV || 'development'
        var maxConnect = 5
        var idle = 1000
        if(env=='test'){
            maxConnect=1
            idle=0
        }  
        var protocol = process.env.ORM_PROTOCOL
        var dbConfig = opts[protocol]
        this.tablePrefix = dbConfig['table_prefix'] || 'minicloud_'
        global.tablePrefix = this.tablePrefix
        var sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
            host: dbConfig.host,
            dialect: process.env.ORM_PROTOCOL,
            pool: {
                max: maxConnect,
                min: 0,
                idle: idle
            },
            logging: false
        })
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
        self.defineUserDepartmentRelationModel()
            //files
        self.defineFileModel()
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
        if (this.oldVersion) {
            var userModel = this.db.define(this.tablePrefix + 'users', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                uuid: {
                    field: 'user_uuid',
                    type: Sequelize.STRING(32)
                },
                name: {
                    field: 'user_name',
                    type: Sequelize.STRING(255)
                },
                password: {
                    field: 'user_pass',
                    type: Sequelize.STRING(255)
                },
                status: {
                    field: 'user_status',
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                salt: {
                    type: Sequelize.STRING(6)
                },
                detail: {
                    field: 'user_name_pinyin',
                    type: Sequelize.STRING(255)
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.userModel = userModel
        this.models.push(userModel)
    }
    /**
     * init table minicloud_user_privileges.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserPrivilegeModel = function() {
        var userPrivilegeModel = this.db.define(this.tablePrefix + 'user_privileges', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
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
        this.userPrivilegeModel = userPrivilegeModel
        this.models.push(userPrivilegeModel)
    }
    /**
     * init table minicloud_user_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserMetaModel = function() {

        if (this.oldVersion) {
            var userMetaModel = this.db.define(this.tablePrefix + 'user_metas', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                user_id: {
                    type: Sequelize.INTEGER
                },
                key: {
                    field: 'meta_key',
                    type: Sequelize.STRING(255)
                },
                value: {
                    field: 'meta_value',
                    type: Sequelize.TEXT
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.userMetaModel = userMetaModel
        this.models.push(userMetaModel)
    }
    /**
     * init table minicloud_events.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineEventModel = function() {
        if (this.oldVersion) {
            var eventModel = this.db.define(this.tablePrefix + 'events', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                uuid: {
                    field: 'event_uuid',
                    type: Sequelize.STRING(64)
                },
                type: {
                    type: Sequelize.INTEGER
                },
                user_id: {
                    type: Sequelize.INTEGER
                },
                device_id: {
                    field: 'user_device_id',
                    type: Sequelize.INTEGER
                },
                action: {
                    type: Sequelize.INTEGER
                },
                path: {
                    field: 'file_path',
                    type: Sequelize.STRING(255)
                },
                context: {
                    type: Sequelize.TEXT
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.eventModel = eventModel
        this.models.push(eventModel)
    }
    /**
     * init table minicloud_devices.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineDeviceModel = function() {

    if (this.oldVersion) {
        var deviceModel = this.db.define(this.tablePrefix + 'user_devices', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                field: 'user_device_uuid',
                type: Sequelize.STRING(32)
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            device_type: {
                field: 'user_device_type',
                type: Sequelize.INTEGER
            },
            client_id: {
                type: Sequelize.STRING(64)
            },
            name: {
                field: 'user_device_name',
                type: Sequelize.STRING(255)
            },
            info: {
                field: 'user_device_info',
                type: Sequelize.STRING(255)
            }
        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
    }
    this.deviceModel = deviceModel
    this.models.push(deviceModel)
}

/**
 * init table minicloud_online_devices.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineOnlineDeviceModel = function() {
        if (this.oldVersion) {
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
                },
                device_type: {
                    field: 'application_id',
                    type: Sequelize.INTEGER
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
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
            },
            parent_group_id: {
                type: Sequelize.INTEGER
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
        var departmentModel = this.db.define(this.tablePrefix + 'groups', {
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
            },
            parent_id: {
                field: 'parent_group_id',
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
     * init table minicloud_user_group_relations.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineUserDepartmentRelationModel = function() {
    var userDepartmentRelationModel = this.db.define(this.tablePrefix + 'user_group_relations', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        department_id: {
            field: 'group_id',
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
    this.userDepartmentRelationModel = userDepartmentRelationModel
    this.models.push(userDepartmentRelationModel)
}

/**
 * init table minicloud_files.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineFileModel = function() {
        if (this.oldVersion) {
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
                    field: 'file_type',
                    type: Sequelize.INTEGER
                },
                client_created_at: {
                    field: 'file_create_time',
                    type: Sequelize.BIGINT
                },
                client_modified_at: {
                    field: 'file_update_time',
                    type: Sequelize.BIGINT
                },
                name: {
                    field: 'file_name',
                    type: Sequelize.STRING(255)
                },
                version_id: {
                    type: Sequelize.INTEGER
                },
                size: {
                    field: 'file_size',
                    type: Sequelize.BIGINT
                },
                path_lower: {
                    field: 'file_path',
                    type: Sequelize.STRING(640)
                },
                is_deleted: {
                    type: Sequelize.BOOLEAN
                },
                mime: {
                    field: 'mime_type',
                    type: Sequelize.STRING(64)
                },
                parent_id: {
                    field:'parent_file_id',
                    type: Sequelize.INTEGER
                },
                file_name_pinyin:{
                    type: Sequelize.STRING(512)
                }

            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.fileModel = fileModel
        this.models.push(fileModel)
    }
    /**
     * init table minicloud_file_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineFileMetaModel = function() {
        if (this.oldVersion) {
            var fileMetaModel = this.db.define(this.tablePrefix + 'file_metas', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                file_id: { 
                    type: Sequelize.INTEGER
                },
                key: {
                    field: 'meta_key',
                    type: Sequelize.STRING(64)
                },
                value: {
                    field: 'meta_value',
                    type: Sequelize.TEXT
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.fileMetaModel = fileMetaModel
        this.models.push(fileMetaModel)
    }
    /**
     * init table minicloud_links.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineLinkModel = function() {
    if (this.oldVersion) {
        var linkModel = this.db.define(this.tablePrefix + 'share_files', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            key: {
                field: 'share_key',
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
                field: 'down_count',
                type: Sequelize.INTEGER
            },
            expires: {
                field: 'expiry',
                type: Sequelize.INTEGER
            }

        }, {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8'
        })
    }
    this.linkModel = linkModel
    this.models.push(linkModel)
}

/**
 * init table minicloud_versions.
 * 
 * @api private
 */
SequelizeLoader.prototype.defineVersionModel = function() {
        if (this.oldVersion) {
            var versionModel = this.db.define(this.tablePrefix + 'file_versions', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                hash: {
                    field: 'file_signature',
                    type: Sequelize.STRING(64)
                },
                size: {
                    field: 'file_size',
                    type: Sequelize.BIGINT
                },
                ref_count: {
                    type: Sequelize.INTEGER
                },
                mime: {
                    field: 'mime_type',
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
        }
        this.versionModel = versionModel
        this.models.push(versionModel)
    }
    /**
     * init table minicloud_version_metas.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineVersionMetaModel = function() {
        if (this.oldVersion) {
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
                    field: 'meta_key',
                    type: Sequelize.STRING(255)
                },
                value: {
                    field: 'meta_value',
                    type: Sequelize.TEXT
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
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
    if (this.oldVersion) {
        tableName = 'file_tags'
    }
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
        if (this.oldVersion) {
            var searchFileModel = this.db.define(this.tablePrefix + 'search_files', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                hash: {
                    field: 'file_signature',
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
        }
        this.searchFileModel = searchFileModel
        this.models.push(searchFileModel)
    }
    /**
     * init table minicloud_search_build_tasks.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineSearchBuildTaskModel = function() {
        if (this.oldVersion) {
            var searchBuildTaskModel = this.db.define(this.tablePrefix + 'search_build_tasks', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                hash: {
                    field: 'file_signature',
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
        }
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
        if (this.oldVersion) {
            var storeBreakFileModel = this.db.define(this.tablePrefix + 'store_break_files', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                hash: {
                    field: 'file_signature',
                    type: Sequelize.STRING(128)
                },
                node_id: {
                    field: 'store_node_id',
                    type: Sequelize.INTEGER
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.storeBreakFileModel = storeBreakFileModel
        this.models.push(storeBreakFileModel)
    }
    /**
     * init table minicloud_store_replicate_tasks.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineStoreReplicateTaskModel = function() {
        if (this.oldVersion) {
            var storeReplicateTaskModel = this.db.define(this.tablePrefix + 'store_replcate_tasks', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                hash: {
                    field: 'file_signature',
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
        }
        this.storeReplicateTaskModel = storeReplicateTaskModel
        this.models.push(storeReplicateTaskModel)
    }
    /**
     * init table minicloud_options.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineOptionModel = function() {
        if (this.oldVersion) {
            var optionModel = this.db.define(this.tablePrefix + 'options', {
                id: {
                    field: 'option_id',
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                key: {
                    field: 'option_name',
                    type: Sequelize.STRING(64)
                },
                value: {
                    field: 'option_value',
                    type: Sequelize.TEXT
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8'
            })
        }
        this.optionModel = optionModel
        this.models.push(optionModel)
    }
    /**
     * init table minicloud_apps.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineAppModel = function() {
        if (this.oldVersion) {
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
                    field: 'client_name',
                    type: Sequelize.STRING(255)
                },
                client_id: {
                    type: Sequelize.STRING(32)
                },
                secret: {
                    field: 'client_secret',
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
        }
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
        var dbLoader = new SequelizeLoader(opts)
        dbLoader.connect(function(err, db) {
            return done(null, db)
        })
    }
}
