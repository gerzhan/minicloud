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
        var protocol = process.env.ORM_PROTOCOL
        var dbConfig = opts[protocol]
        this.tablePrefix = dbConfig['table_prefix'] || 'minicloud_'
        global.tablePrefix = this.tablePrefix
        var sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
            host: dbConfig.host,
            dialect: process.env.ORM_PROTOCOL,
            pool: {
                max: 5,
                min: 0,
                idle: 10000
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
                updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
                    type: Sequelize.STRING
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
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
                updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
                updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
        updatedAt: 'updated_at'
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
                file_created_at: {
                    field: 'file_create_time',
                    type: Sequelize.INTEGER
                },
                file_updated_at: {
                    field: 'file_update_time',
                    type: Sequelize.INTEGER
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
                    type: Sequelize.INTEGER
                },
                path: {
                    field: 'file_path',
                    type: Sequelize.STRING(640)
                },
                is_deleted: {
                    type: Sequelize.INTEGER
                },
                mime_type: {
                    type: Sequelize.STRING(64)
                }

            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
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
                path: {
                    field: 'file_path',
                    type: Sequelize.STRING(640)
                },
                key: {
                    field: 'meta_key',
                    type: Sequelize.STRING(640)
                },
                value: {
                    field: 'meta_value',
                    type: Sequelize.TEXT
                }
            }, {
                createdAt: 'created_at',
                updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
                    type: Sequelize.INTEGER
                },
                ref_count: {
                    type: Sequelize.INTEGER
                },
                mime_type: {
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
                updatedAt: 'updated_at'
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
                updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
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
            updatedAt: 'updated_at'
        })
        this.fileTagRelationModel = fileTagRelationModel
        this.models.push(fileTagRelationModel)
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
