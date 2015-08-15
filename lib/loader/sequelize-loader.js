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
            }
        })
        self.db = sequelize
            //user
        self.defineUserModel()
        self.defineUserMetaModel()
        cb(null, self)
            // orm.coConnect(self.connectionString, function(err, db) {

        //     if (global.testModel) {
        //         db.settings.set('instance.cache', false)
        //     }
        //     self.db = db 
        //         //user
        //     self.defineUserModel()
        //     // self.defineUserPrivilegeModel()
        //     // self.defineUserMetaModel()
        //     //     //device
        //     // self.defineDeviceModel()
        //     // self.defineOnlineDeviceModel()
        //     //     //group
        //     // self.defineGroupModel()
        //     // self.defineGroupPrivilegeModel()
        //     // self.defineUserGroupRelationModel()
        //     //     //department
        //     // self.defineDepartmentModel() 
        //     // self.defineUserDepartmentRelationModel()
        //     //     //files
        //     // self.defineFileModel()
        //     // self.defineFileMetaModel()
        //     // self.defineLinkModel()
        //     // self.defineVersionModel()
        //     // self.defineVersionMetaModel()
        //     //     //tag
        //     // self.defineTagModel()
        //     // self.defineFileTagRelationModel()
        //     //     //chooser
        //     // self.defineChooserModel()
        //     // self.defineChooserDomainModel()
        //     // self.defineChooserLinkModel()
        //     // self.defineChooserSelectFileModel()
        //     //     //event
        //     // self.defineEventModel()
        //     //     //doc
        //     // self.defineDocNodeModel()
        //     //     //search            
        //     // self.defineSearchNodeModel()
        //     // self.defineSearchFileModel()
        //     // self.defineSearchBuildTaskModel()
        //     //     //store
        //     // self.defineStoreNodeModel()
        //     // self.defineStoreBreakFileModel()
        //     // self.defineStoreReplicateTaskModel()
        //     //     //other
        //     // self.defineOptionModel()
        //     // self.defineAppModel()
        //     // self.defineTokenModel()
        //     // self.defineRefreshTokenModel()
        //     // self.defineCursorModel()
        //     cb(err, self)
        // });
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
                },
                createdAt: {
                    type: Sequelize.DATE,
                    field: 'created_at'
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    field: 'updated_at'
                }
            }, {
                hooks: {
                    beforeCreate: function(user, options) {
                        this.createdAt = new Date()
                        this.updatedAt = new Date()
                    },
                    afterUpdate: function(user, options) {
                        this.updatedAt = new Date()
                    }
                }
            })
        } else {
            // var userModel = this.db.coDefine(this.tablePrefix + 'users', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     uuid: {
            //         type: 'text',
            //         unique: true,
            //         size: 32
            //     },
            //     name: {
            //         type: 'text',
            //         unique: true,
            //         size: 32
            //     },
            //     password: {
            //         type: 'text',
            //         size: 64
            //     },
            //     status: {
            //         type: 'boolean',
            //         defaultValue: true
            //     },
            //     salt: {
            //         type: 'text',
            //         size: 6
            //     },
            //     detail: {
            //         type: 'text',
            //         size: 255
            //     }
            // }, {
            //     timestamp: true
            // })
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
        var userPrivilegeModel = this.db.coDefine(this.tablePrefix + 'user_privileges', {
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
            hooks: {
                beforeCreate: function(user, options) {
                    this.createdAt = new Date()
                    this.updatedAt = new Date()
                },
                afterUpdate: function(user, options) {
                    this.updatedAt = new Date()
                }
            }
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
                },
                createdAt: {
                    type: Sequelize.DATE,
                    field: 'created_at'
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    field: 'updated_at'
                }
            }, {
                hooks: {
                    beforeCreate: function(user, options) {
                        this.createdAt = new Date()
                        this.updatedAt = new Date()
                    },
                    afterUpdate: function(user, options) {
                        this.updatedAt = new Date()
                    }
                }
            })
        } else {
            // var userMetaModel = this.db.coDefine(this.tablePrefix + 'user_metas', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     user_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     key: {
            //         type: 'text',
            //         size: 32
            //     },
            //     value: {
            //         type: 'text',
            //         size: 255
            //     }
            // }, {
            //     timestamp: true
            // })
        }
        this.userMetaModel = userMetaModel
        this.models.push(userMetaModel)
    }
    /**
     * init table minicloud_devices.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineDeviceModel = function() {

    if (this.oldVersion) {
        var deviceModel = this.db.coDefine(this.tablePrefix + 'user_devices', {
            id: {
                type: 'serial',
                key: true
            },
            uuid: {
                mapsTo: 'user_device_uuid',
                type: 'text',
                size: 32
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            device_type: {
                mapsTo: 'user_device_type',
                type: 'integer',
                size: 8
            },
            client_id: {
                type: 'text',
                size: 64
            },
            name: {
                mapsTo: 'user_device_name',
                type: 'text',
                size: 255
            },
            info: {
                mapsTo: 'user_device_info',
                type: 'text',
                size: 255
            }
        }, {
            timestamp: true
        })
    } else {
        // var deviceModel = this.db.coDefine(this.tablePrefix + 'devices', {
        //     id: {
        //         type: 'serial',
        //         key: true
        //     },
        //     uuid: {
        //         type: 'text',
        //         size: 32
        //     },
        //     user_id: {
        //         type: 'integer',
        //         size: 8
        //     },
        //     client_id: {
        //         type: 'text',
        //         size: 64
        //     },
        //     name: {
        //         type: 'text',
        //         size: 64
        //     },
        //     info: {
        //         type: 'text',
        //         size: 255
        //     }
        // }, {
        //     timestamp: true
        // })
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
            var onlineDeviceModel = this.db.coDefine(this.tablePrefix + 'online_devices', {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: 'integer',
                    size: 8
                },
                device_id: {
                    type: 'integer',
                    size: 8
                },
                client_id: {
                    type: 'text',
                    size: 64
                },
                device_type: {
                    mapsTo: 'application_id',
                    type: 'integer',
                    size: 8
                }
            }, {
                timestamp: true
            })
        } else {
            // var onlineDeviceModel = this.db.coDefine(this.tablePrefix + 'online_devices', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     device_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     client_id: {
            //         type: 'text',
            //         size: 64
            //     }
            // }, {
            //     timestamp: true
            // })
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
        var groupModel = this.db.coDefine(this.tablePrefix + 'groups', {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            name: {
                type: 'text',
                size: 128
            },
            description: {
                type: 'text',
                size: 255
            },
            parent_group_id: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
        var groupPrivilegeModel = this.db.coDefine(this.tablePrefix + 'group_privileges', {
            id: {
                type: 'serial',
                key: true
            },
            group_id: {
                type: 'integer',
                size: 8
            },
            file_path: {
                type: 'text',
                size: 255
            },
            permission: {
                type: 'text',
                size: 255
            }
        }, {
            timestamp: true
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
        var userGroupRelationModel = this.db.coDefine(this.tablePrefix + 'user_group_relations', {
            id: {
                type: 'serial',
                key: true
            },
            group_id: {
                type: 'integer',
                size: 8
            },
            user_id: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
        var departmentModel = this.db.coDefine(this.tablePrefix + 'groups', {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            name: {
                type: 'text',
                size: 128
            },
            description: {
                type: 'text',
                size: 255
            },
            parent_id: {
                mapsTo: 'parent_group_id',
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
        var userDepartmentRelationModel = this.db.coDefine(this.tablePrefix + 'user_group_relations', {
            id: {
                type: 'serial',
                key: true
            },
            department_id: {
                mapsTo: 'group_id',
                type: 'integer',
                size: 8
            },
            user_id: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
            var fileModel = this.db.coDefine(this.tablePrefix + 'files', {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: 'integer',
                    size: 8
                },
                type: {
                    mapsTo: 'file_type',
                    type: 'integer',
                    size: 2
                },
                file_created_at: {
                    mapsTo: 'file_create_time',
                    type: 'integer',
                    size: 8
                },
                file_updated_at: {
                    mapsTo: 'file_update_time',
                    type: 'integer',
                    size: 8
                },
                name: {
                    mapsTo: 'file_name',
                    type: 'text',
                    size: 255
                },
                version_id: {
                    type: 'integer',
                    size: 8
                },
                size: {
                    mapsTo: 'file_size',
                    type: 'integer',
                    size: 8
                },
                path: {
                    mapsTo: 'file_path',
                    type: 'text',
                    size: 640
                },
                is_deleted: {
                    type: 'integer',
                    size: 2
                },
                mime_type: {
                    type: 'text',
                    size: 64
                },

            }, {
                timestamp: true
            })
        } else {
            // var fileModel = this.db.coDefine(this.tablePrefix + 'files', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     user_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     type: {
            //         type: 'integer',
            //         size: 2
            //     },
            //     file_created_at: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     file_updated_at: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     name: {
            //         type: 'text',
            //         size: 255
            //     },
            //     version_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     size: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     path: {
            //         type: 'text',
            //         size: 640
            //     },
            //     is_deleted: {
            //         type: 'integer',
            //         size: 2
            //     },
            //     mime_type: {
            //         type: 'integer',
            //         size: 2
            //     },

            // }, {
            //     timestamp: true
            // })
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
            var fileMetaModel = this.db.coDefine(this.tablePrefix + 'file_metas', {
                id: {
                    type: 'serial',
                    key: true
                },
                path: {
                    mapsTo: 'file_path',
                    type: 'text',
                    size: 640
                },
                key: {
                    mapsTo: 'meta_key',
                    type: 'text',
                    size: 255
                },
                value: {
                    mapsTo: 'meta_value',
                    type: 'text'
                }
            }, {
                timestamp: true
            })
        } else {
            // var fileMetaModel = this.db.coDefine(this.tablePrefix + 'file_metas', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     path: {
            //         type: 'text',
            //         size: 640
            //     },
            //     key: {
            //         type: 'text',
            //         size: 255
            //     },
            //     value: {
            //         type: 'text'
            //     }
            // }, {
            //     timestamp: true
            // })
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
        var linkModel = this.db.coDefine(this.tablePrefix + 'share_files', {
            id: {
                type: 'serial',
                key: true
            },
            key: {
                mapsTo: 'share_key',
                type: 'text',
                size: 32
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            file_id: {
                type: 'integer',
                size: 8
            },
            password: {
                type: 'text',
                size: 8
            },
            download_count: {
                mapsTo: 'down_count',
                type: 'integer',
                size: 8
            },
            expires: {
                mapsTo: 'expiry',
                type: 'integer',
                size: 8
            }

        }, {
            timestamp: true
        })
    } else {
        // var linkModel = this.db.coDefine(this.tablePrefix + 'links', {
        //     id: {
        //         type: 'serial',
        //         key: true
        //     },
        //     key: {
        //         type: 'text',
        //         size: 32
        //     },
        //     user_id: {
        //         type: 'integer',
        //         size: 8
        //     },
        //     file_id: {
        //         type: 'integer',
        //         size: 8
        //     },
        //     password: {
        //         type: 'text',
        //         size: 8
        //     },
        //     download_count: {
        //         type: 'integer',
        //         size: 8
        //     },
        //     expires: {
        //         type: 'integer',
        //         size: 8
        //     }

        // }, {
        //     timestamp: true
        // })
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
            var versionModel = this.db.coDefine(this.tablePrefix + 'file_versions', {
                id: {
                    type: 'serial',
                    key: true
                },
                hash: {
                    mapsTo: 'file_signature',
                    type: 'text',
                    size: 64
                },
                size: {
                    mapsTo: 'file_size',
                    type: 'integer',
                    size: 8
                },
                ref_count: {
                    type: 'integer',
                    size: 4
                },
                mime_type: {
                    type: 'text',
                    size: 64
                },
                doc_convert_status: {
                    type: 'integer',
                    size: 2,
                    defaultValue: 0
                },
                replicate_status: {
                    type: 'integer',
                    size: 2,
                    defaultValue: 0
                }
            }, {
                timestamp: true
            })
        } else {
            // var versionModel = this.db.coDefine(this.tablePrefix + 'versions', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     hash: {
            //         type: 'text',
            //         size: 64
            //     },
            //     size: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     ref_count: {
            //         type: 'integer',
            //         size: 4
            //     },
            //     mime_type: {
            //         type: 'text',
            //         size: 64
            //     },
            //     doc_convert_status: {
            //         type: 'integer',
            //         size: 2
            //     },
            //     replicate_status: {
            //         type: 'integer',
            //         size: 2
            //     }
            // }, {
            //     timestamp: true
            // })
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
            var versionMetaModel = this.db.coDefine(this.tablePrefix + 'file_version_metas', {
                id: {
                    type: 'serial',
                    key: true
                },
                version_id: {
                    type: 'integer',
                    size: 8
                },
                key: {
                    mapsTo: 'meta_key',
                    type: 'text',
                    size: 255
                },
                value: {
                    mapsTo: 'meta_value',
                    type: 'text'
                }
            }, {
                timestamp: true
            })
        } else {
            // var versionMetaModel = this.db.coDefine(this.tablePrefix + 'version_metas', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     version_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     key: {
            //         type: 'text',
            //         size: 255
            //     },
            //     value: {
            //         type: 'text'
            //     }
            // }, {
            //     timestamp: true
            // })
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
        var tagModel = this.db.coDefine(this.tablePrefix + 'tags', {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            name: {
                type: 'text',
                size: 128
            }
        }, {
            timestamp: true
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
        var fileTagRelationModel = this.db.coDefine(this.tablePrefix + tableName, {
            id: {
                type: 'serial',
                key: true
            },
            tag_id: {
                type: 'integer',
                size: 8
            },
            file_id: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
        var chooserModel = this.db.coDefine(this.tablePrefix + 'choosers', {
            id: {
                type: 'serial',
                key: true
            },
            name: {
                type: 'text',
                size: 64
            },
            app_key: {
                type: 'text',
                size: 128
            },
            type: {
                type: 'integer',
                size: 2
            }
        }, {
            timestamp: true
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
        var chooserDomainModel = this.db.coDefine(this.tablePrefix + 'chooser_domains', {
            id: {
                type: 'serial',
                key: true
            },
            chooser_id: {
                type: 'integer',
                size: 8
            },
            domain: {
                type: 'text',
                size: 255
            }
        }, {
            timestamp: true
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
        var chooserLinkModel = this.db.coDefine(this.tablePrefix + 'chooser_links', {
            id: {
                type: 'serial',
                key: true
            },
            link_id: {
                type: 'integer',
                size: 8
            },
            app_key: {
                type: 'text',
                size: 32
            },
            session: {
                type: 'text',
                size: 32
            }
        }, {
            timestamp: true
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
        var chooserSelectFileModel = this.db.coDefine(this.tablePrefix + 'chooser_select_files', {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            file_key: {
                type: 'text',
                size: 255
            },
            file_ids: {
                type: 'text',
                size: 255
            }
        }, {
            timestamp: true
        })
        this.chooserSelectFileModel = chooserSelectFileModel
        this.models.push(chooserSelectFileModel)
    }
    /**
     * init table minicloud_events.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineEventModel = function() {
        if (this.oldVersion) {
            var eventModel = this.db.coDefine(this.tablePrefix + 'events', {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    mapsTo: 'event_uuid',
                    type: 'text',
                    size: 64
                },
                type: {
                    type: 'integer',
                    size: 2
                },
                user_id: {
                    type: 'integer',
                    size: 8
                },
                device_id: {
                    mapsTo: 'user_device_id',
                    type: 'integer',
                    size: 8
                },
                action: {
                    type: 'integer',
                    size: 2
                },
                path: {
                    mapsTo: 'file_path',
                    type: 'text',
                    size: 255
                },
                context: {
                    type: 'text'
                }
            }, {
                timestamp: true
            })
        } else {
            // var eventModel = this.db.coDefine(this.tablePrefix + 'events', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     uuid: {
            //         type: 'text',
            //         size: 64
            //     },
            //     type: {
            //         type: 'integer',
            //         size: 2,
            //         defaultValue: 1
            //     },
            //     user_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     device_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     action: {
            //         type: 'integer',
            //         size: 2
            //     },
            //     path: {
            //         type: 'text',
            //         size: 255
            //     },
            //     context: {
            //         type: 'text'
            //     }
            // }, {
            //     timestamp: true
            // })
        }

        this.eventModel = eventModel
        this.models.push(eventModel)
    }
    /**
     * init table minicloud_doc_nodes.
     * 
     * @api private
     */
SequelizeLoader.prototype.defineDocNodeModel = function() {
        var docNodeModel = this.db.coDefine(this.tablePrefix + 'doc_nodes', {
            id: {
                type: 'serial',
                key: true
            },
            name: {
                type: 'text',
                size: 128
            },
            host: {
                type: 'text',
                size: 128
            },
            safe_code: {
                type: 'text',
                size: 128
            },
            status: {
                type: 'integer',
                size: 2
            },
            converted_file_count: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
        var searchNodeModel = this.db.coDefine(this.tablePrefix + 'search_nodes', {
            id: {
                type: 'serial',
                key: true
            },
            name: {
                type: 'text',
                size: 128
            },
            host: {
                type: 'text',
                size: 128
            },
            safe_code: {
                type: 'text',
                size: 128
            },
            status: {
                type: 'integer',
                size: 2
            },
            build_file_count: {
                type: 'integer',
                size: 8
            },
            search_count: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
            var searchFileModel = this.db.coDefine(this.tablePrefix + 'search_files', {
                id: {
                    type: 'serial',
                    key: true
                },
                hash: {
                    mapsTo: 'file_signature',
                    type: 'text',
                    size: 64
                },
                node_ids: {
                    type: 'text',
                    size: 128
                }
            }, {
                timestamp: true
            })
        } else {
            // var searchFileModel = this.db.coDefine(this.tablePrefix + 'search_files', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     hash: {
            //         type: 'text',
            //         size: 64
            //     },
            //     node_ids: {
            //         type: 'text',
            //         size: 128
            //     }
            // }, {
            //     timestamp: true
            // })
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
            var searchBuildTaskModel = this.db.coDefine(this.tablePrefix + 'search_build_tasks', {
                id: {
                    type: 'serial',
                    key: true
                },
                hash: {
                    mapsTo: 'file_signature',
                    type: 'text',
                    size: 64
                },
                node_id: {
                    type: 'integer',
                    size: 8
                },
                status: {
                    type: 'integer',
                    size: 2
                }
            }, {
                timestamp: true
            })
        } else {
            // var searchBuildTaskModel = this.db.coDefine(this.tablePrefix + 'search_build_tasks', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     hash: {
            //         type: 'text',
            //         size: 64
            //     },
            //     node_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     status: {
            //         type: 'integer',
            //         size: 2
            //     }
            // }, {
            //     timestamp: true
            // })
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
        var storeNodeModel = this.db.coDefine(this.tablePrefix + 'store_nodes', {
            id: {
                type: 'serial',
                key: true
            },
            name: {
                type: 'text',
                size: 128
            },
            host: {
                type: 'text',
                size: 128
            },
            safe_code: {
                type: 'text',
                size: 128
            },
            status: {
                type: 'integer',
                size: 2
            },
            saved_file_count: {
                type: 'integer',
                size: 8
            },
            downloaded_file_count: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
            var storeBreakFileModel = this.db.coDefine(this.tablePrefix + 'store_break_files', {
                id: {
                    type: 'serial',
                    key: true
                },
                hash: {
                    mapsTo: 'file_signature',
                    type: 'text',
                    size: 128
                },
                node_id: {
                    mapsTo: 'store_node_id',
                    type: 'integer',
                    size: 8
                }
            }, {
                timestamp: true
            })
        } else {
            // var storeBreakFileModel = this.db.coDefine(this.tablePrefix + 'store_break_files', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     hash: {
            //         type: 'text',
            //         size: 128
            //     },
            //     node_id: {
            //         type: 'integer',
            //         size: 8
            //     }
            // }, {
            //     timestamp: true
            // })
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
            var storeReplicateTaskModel = this.db.coDefine(this.tablePrefix + 'store_replcate_tasks', {
                id: {
                    type: 'serial',
                    key: true
                },
                hash: {
                    mapsTo: 'file_signature',
                    type: 'text',
                    size: 128
                },
                node_id: {
                    type: 'integer',
                    size: 8
                },
                status: {
                    type: 'integer',
                    size: 2
                }
            }, {
                timestamp: true
            })
        } else {
            // var storeReplicateTaskModel = this.db.coDefine(this.tablePrefix + 'store_replcate_tasks', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     hash: {
            //         type: 'text',
            //         size: 128
            //     },
            //     node_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     status: {
            //         type: 'integer',
            //         size: 2
            //     }
            // }, {
            //     timestamp: true
            // })
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
            var optionModel = this.db.coDefine(this.tablePrefix + 'options', {
                id: {
                    mapsTo: 'option_id',
                    type: 'serial',
                    key: true
                },
                key: {
                    mapsTo: 'option_name',
                    type: 'text',
                    size: 64
                },
                value: {
                    mapsTo: 'option_value',
                    type: 'text'
                }
            }, {
                timestamp: true
            })
        } else {
            // var optionModel = this.db.coDefine(this.tablePrefix + 'options', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     key: {
            //         type: 'text',
            //         unique: true,
            //         size: 64
            //     },
            //     value: {
            //         type: 'text'
            //     }
            // }, {
            //     timestamp: true
            // })
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
            var appModel = this.db.coDefine(this.tablePrefix + 'clients', {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: 'integer',
                    size: 8
                },
                name: {
                    mapsTo: 'client_name',
                    type: 'text',
                    size: 255
                },
                client_id: {
                    type: 'text',
                    unique: true,
                    size: 32
                },
                secret: {
                    mapsTo: 'client_secret',
                    type: 'text',
                    size: 64
                },
                redirect_uri: {
                    type: 'text',
                    size: 255
                },
                enabled: {
                    type: 'boolean',
                    defaultValue: true
                },
                description: {
                    type: 'text',
                    size: 255
                }
            }, {
                timestamp: true
            })
        } else {
            // var appModel = this.db.coDefine(this.tablePrefix + 'apps', {
            //     id: {
            //         type: 'serial',
            //         key: true
            //     },
            //     user_id: {
            //         type: 'integer',
            //         size: 8
            //     },
            //     name: {
            //         type: 'text',
            //         unique: true,
            //         size: 64
            //     },
            //     client_id: {
            //         type: 'text',
            //         unique: true,
            //         size: 64
            //     },
            //     secret: {
            //         type: 'text',
            //         size: 64
            //     },
            //     redirect_uri: {
            //         type: 'text',
            //         size: 255
            //     },
            //     enabled: {
            //         type: 'boolean',
            //         defaultValue: true
            //     },
            //     description: {
            //         type: 'text',
            //         size: 255
            //     }
            // }, {
            //     timestamp: true
            // })
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
        var tokenModel = this.db.coDefine(this.tablePrefix + 'oauth_access_tokens', {
            id: {
                type: 'serial',
                key: true
            },
            access_token: {
                type: 'text',
                unique: true,
                size: 128
            },
            client_id: {
                type: 'text',
                size: 128
            },
            device_id: {
                type: 'integer',
                size: 8
            },
            expires: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
        var refreshTokenModel = this.db.coDefine(this.tablePrefix + 'oauth_refresh_tokens', {
            id: {
                type: 'serial',
                key: true
            },
            refresh_token: {
                type: 'text',
                unique: true,
                size: 128
            },
            client_id: {
                type: 'text',
                size: 128
            },
            user_id: {
                type: 'integer',
                size: 8
            },
            expires: {
                type: 'integer',
                size: 8
            }
        }, {
            timestamp: true
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
    var cursorModel = this.db.coDefine(this.tablePrefix + 'cursors', {
        id: {
            type: 'serial',
            key: true
        },
        cursor: {
            type: 'text',
            unique: true,
            size: 64
        },
        value: {
            type: 'integer',
            size: 8
        }
    }, {
        timestamp: true
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
