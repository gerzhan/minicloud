'use strict'
/**
 * database connect.
 * Support MySQL & MariaDB/PostgreSQL/Amazon Redshift/SQLite/MongoDB
 * @param {Object} config 
 * @api public
 */
function DBLoader(config) {
    this.config = config
    this.oldVersion = config.version < 3
    this.models = []
}
/**
 * travis-ci
 * @api private
 */
DBLoader.prototype.isTravis = function() {
        return Boolean(process.env.CI);
    }
    /**
     * db config first env.ORM_PROTOCOL,then config.json follow mysql,postgres,redshift,mongodb,sqlite
     * @api private
     */
DBLoader.prototype.setDBConfig = function() {
        var opts = this.config
        var protocol = process.env.ORM_PROTOCOL
        if (typeof(protocol) == 'undefined') {
            protocol = 'mysql'
        }
        var dbConfig = opts[protocol]
        if (typeof(dbConfig) == 'undefined') {
            var protocols = ['mysql', 'postgres', 'redshift', 'mongodb', 'sqlite']
            for (var i = 0; i < protocols.length; i++) {
                protocol = protocols[i]
                var dbConfig = opts[protocol]
                if (typeof(dbConfig) != 'undefined') {
                    break
                }
            }
        }
        var util = require('util')
        var connectionString = ""
        switch (protocol) {
            case 'mysql':
            case 'postgres':
            case 'redshift':
            case 'mongodb':
                if (this.isTravis()) {
                    if (protocol == 'redshift') protocol = 'postgres'
                    connectionString = util.format("%s://%s@%s/%s",
                        protocol, dbConfig.user, dbConfig.host, dbConfig.database
                    )
                } else {
                    connectionString = util.format("%s://%s:%s@%s:%d/%s",
                        protocol, dbConfig.user, dbConfig.password,
                        dbConfig.host, dbConfig.port, dbConfig.database
                    ).replace(':@', '@')
                }
                break
            case 'sqlite':
                connectionString = util.format("%s://%s", protocol, dbConfig.path)
                break
            default:
                throw new Error("Unknown protocol " + protocol)

        }
        this.connectionString = connectionString
        this.tablePrefix = dbConfig["table_prefix"] || "minicloud_"
    }
    /**
     * Return database connect.
     *
     * connect database and init orm object for every database table
     * @param {Function} cb
     * @return {Object}
     * @api public
     */
DBLoader.prototype.connect = function(cb) {
        var orm = require('co-orm')
        var modts = require('orm-timestamps')
        var self = this
        self.setDBConfig()
        orm.coConnect(self.connectionString, function(err, db) {
            if (err) {
                console.log(err)
                cb(err)
                return;
            }
            self.db = db
            db.use(modts, {
                    createdProperty: 'created_at',
                    modifiedProperty: 'updated_at',
                    expireProperty: false,
                    dbtype: {
                        type: 'date',
                        time: true
                    },
                    now: function() {
                        return new Date();
                    },
                    persist: true
                })
                //user
            self.defineUserModel()
            self.defineUserPrivilegeModel()
            self.defineUserMetaModel()
                //device
            self.defineDeviceModel()
            self.defineDeviceMetaModel()
            self.defineOnlineDeviceModel()
                //group
            self.defineGroupModel()
            self.defineGroupPrivilegeModel()
            self.defineGroupRelationModel()
            self.defineUserGroupRelationModel()
                //files
            self.defineFileModel()
            self.defineFileMetaModel()
            self.defineLinkModel()
            self.defineVersionModel()
            self.defineVersionMetaModel()
                //chooser
            self.defineChooserModel()
            self.defineChooserDomainModel()
            self.defineChooserLinkModel()
            self.defineChooserSelectFileModel()
                //event
            self.defineEventModel()

            //other
            self.defineOptionModel()
            self.defineAppModel()
            self.defineTokenModel()
            self.defineRefreshTokenModel()
            self.defineLogModel()
            cb(err, self)
        });
    }
    /**
     * init table minicloud_users.
     * 
     * @api private
     */
DBLoader.prototype.defineUserModel = function() {
        if (this.oldVersion) {
            var userModel = this.db.coDefine(this.tablePrefix + "users", {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    mapsTo: 'user_uuid',
                    type: "text",
                    size: 32
                },
                name: {
                    mapsTo: 'user_name',
                    type: "text",
                    size: 255
                },
                password: {
                    mapsTo: 'user_pass',
                    type: "text",
                    size: 255
                },
                status: {
                    mapsTo: 'user_status',
                    type: "boolean",
                    defaultValue: true
                },
                salt: {
                    type: "text",
                    size: 6
                }
            }, {
                timestamp: true
            })
        } else {
            var userModel = this.db.coDefine(this.tablePrefix + "users", {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    type: "text",
                    unique: true,
                    size: 32
                },
                name: {
                    type: "text",
                    unique: true,
                    size: 32
                },
                password: {
                    type: "text",
                    size: 64
                },
                status: {
                    type: "boolean",
                    defaultValue: true
                },
                salt: {
                    type: "text",
                    size: 6
                }
            }, {
                timestamp: true
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
DBLoader.prototype.defineUserPrivilegeModel = function() {
        var userPrivilegeModel = this.db.coDefine(this.tablePrefix + "user_privileges", {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: "integer",
                size: 8
            },
            file_path: {
                type: "text",
                size: 255
            },
            permission: {
                type: "text",
                size: 255
            }
        }, {
            timestamp: true
        })
        this.userPrivilegeModel = userPrivilegeModel
        this.models.push(userPrivilegeModel)
    }
    /**
     * init table minicloud_user_metas.
     * 
     * @api private
     */
DBLoader.prototype.defineUserMetaModel = function() {

        if (this.oldVersion) {
            var userMetaModel = this.db.coDefine(this.tablePrefix + "user_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                key: {
                    mapsTo: 'meta_key',
                    type: "text",
                    size: 255
                },
                value: {
                    mapsTo: 'meta_value',
                    type: "text"
                }
            }, {
                timestamp: true
            })
        } else {
            var userMetaModel = this.db.coDefine(this.tablePrefix + "user_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                key: {
                    type: "text",
                    size: 32
                },
                value: {
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
            })
        }
        this.userMetaModel = userMetaModel
        this.models.push(userMetaModel)
    }
    /**
     * init table minicloud_devices.
     * 
     * @api private
     */
DBLoader.prototype.defineDeviceModel = function() {

        if (this.oldVersion) {
            var deviceModel = this.db.coDefine(this.tablePrefix + "user_devices", {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    mapsTo: "user_device_uuid",
                    type: "text",
                    size: 32
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                device_type: {
                    mapsTo: "user_device_type",
                    type: "integer",
                    size: 8
                },
                client_id: {
                    type: "text",
                    size: 64
                },
                name: {
                    mapsTo: "user_device_name",
                    type: "text",
                    size: 255
                },
                info: {
                    mapsTo: "user_device_info",
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
            })
        } else {
            var deviceModel = this.db.coDefine(this.tablePrefix + "devices", {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    type: "text",
                    size: 32
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                client_id: {
                    type: "text",
                    size: 64
                },
                name: {
                    type: "text",
                    size: 64
                },
                info: {
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
            })
        }
        this.deviceModel = deviceModel
        this.models.push(deviceModel)
    }
    /**
     * init table minicloud_device_metas.
     * 
     * @api private
     */
DBLoader.prototype.defineDeviceMetaModel = function() {
        if (this.oldVersion) {
            var deviceMetaModel = this.db.coDefine(this.tablePrefix + "user_devices_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                device_id: {
                    type: "integer",
                    size: 8
                },
                name: {
                    mapsTo: "meta_name",
                    type: "text",
                    size: 64
                },
                value: {
                    mapsTo: "meta_value",
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
            })
        } else {
            var deviceMetaModel = this.db.coDefine(this.tablePrefix + "device_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                device_id: {
                    type: "integer",
                    size: 8
                },
                name: {
                    type: "text",
                    size: 64
                },
                value: {
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
            })
        }
        this.deviceMetaModel = deviceMetaModel
        this.models.push(deviceMetaModel)
    }
    /**
     * init table minicloud_online_devices.
     * 
     * @api private
     */
DBLoader.prototype.defineOnlineDeviceModel = function() {
        if (this.oldVersion) {
            var onlineDeviceModel = this.db.coDefine(this.tablePrefix + "online_devices", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                device_id: {
                    type: "integer",
                    size: 8
                },
                client_id: {
                    type: "text",
                    size: 64
                },
                device_type: {
                    mapsTo: "application_id",
                    type: "integer",
                    size: 8
                }
            }, {
                timestamp: true
            })
        } else {
            var onlineDeviceModel = this.db.coDefine(this.tablePrefix + "online_devices", {
                id: {
                    type: 'serial',
                    key: true
                },
                device_id: {
                    type: "integer",
                    size: 8
                },
                client_id: {
                    type: "text",
                    size: 64
                }
            }, {
                timestamp: true
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
DBLoader.prototype.defineGroupModel = function() {
        var groupModel = this.db.coDefine(this.tablePrefix + "groups", {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: "integer",
                size: 8
            },
            name: {
                type: "text",
                size: 128
            },
            description: {
                type: "text",
                size: 255
            },
            parent_group_id: {
                type: "integer",
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
DBLoader.prototype.defineGroupPrivilegeModel = function() {
        var groupPrivilegeModel = this.db.coDefine(this.tablePrefix + "group_privileges", {
            id: {
                type: 'serial',
                key: true
            },
            group_id: {
                type: "integer",
                size: 8
            },
            file_path: {
                type: "text",
                size: 255
            },
            permission: {
                type: "text",
                size: 255
            }
        }, {
            timestamp: true
        })
        this.groupPrivilegeModel = groupPrivilegeModel
        this.models.push(groupPrivilegeModel)
    }
    /**
     * init table minicloud_group_relations.
     * 
     * @api private
     */
DBLoader.prototype.defineGroupRelationModel = function() {
        var groupRelationModel = this.db.coDefine(this.tablePrefix + "group_relations", {
            id: {
                type: 'serial',
                key: true
            },
            group_id: {
                type: "integer",
                size: 8
            },
            parent_group_id: {
                type: "integer",
                size: 8
            }
        }, {
            timestamp: true
        })
        this.groupRelationModel = groupRelationModel
        this.models.push(groupRelationModel)
    }
    /**
     * init table minicloud_user_group_relations.
     * 
     * @api private
     */
DBLoader.prototype.defineUserGroupRelationModel = function() {
        var userGroupRelationModel = this.db.coDefine(this.tablePrefix + "user_group_relations", {
            id: {
                type: 'serial',
                key: true
            },
            group_id: {
                type: "integer",
                size: 8
            },
            user_id: {
                type: "integer",
                size: 8
            }
        }, {
            timestamp: true
        })
        this.userGroupRelationModel = userGroupRelationModel
        this.models.push(userGroupRelationModel)
    }
    /**
     * init table minicloud_files.
     * 
     * @api private
     */
DBLoader.prototype.defineFileModel = function() {
        if (this.oldVersion) {
            var fileModel = this.db.coDefine(this.tablePrefix + "files", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                type: {
                    mapsTo: "file_type",
                    type: "integer",
                    size: 2
                },
                file_created_time: {
                    mapsTo: 'file_create_time',
                    type: "integer",
                    size: 8
                },
                file_updated_time: {
                    mapsTo: 'file_update_time',
                    type: "integer",
                    size: 8
                },
                name: {
                    mapsTo: 'file_name',
                    type: "text",
                    size: 255
                },
                version_id: {
                    type: "integer",
                    size: 8
                },
                size: {
                    mapsTo: 'file_size',
                    type: "integer",
                    size: 8
                },
                path: {
                    mapsTo: 'file_path',
                    type: "text",
                    size: 640
                },
                is_deleted: {
                    type: "integer",
                    size: 2
                },
                mime_type: {
                    type: "integer",
                    size: 2
                },

            }, {
                timestamp: true
            })
        } else {
            var fileModel = this.db.coDefine(this.tablePrefix + "files", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                type: {
                    type: "integer",
                    size: 2
                },
                file_created_time: {
                    type: "integer",
                    size: 8
                },
                file_updated_time: {
                    type: "integer",
                    size: 8
                },
                name: {
                    type: "text",
                    size: 255
                },
                version_id: {
                    type: "integer",
                    size: 8
                },
                size: {
                    type: "integer",
                    size: 8
                },
                path: {
                    type: "text",
                    size: 640
                },
                is_deleted: {
                    type: "integer",
                    size: 2
                },
                mime_type: {
                    type: "integer",
                    size: 2
                },

            }, {
                timestamp: true
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
DBLoader.prototype.defineFileMetaModel = function() {
        if (this.oldVersion) {
            var fileMetaModel = this.db.coDefine(this.tablePrefix + "file_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                path: {
                    mapsTo: 'file_path',
                    type: "text",
                    size: 640
                },
                key: {
                    mapsTo: "meta_key",
                    type: "text",
                    size: 255
                },
                value: {
                    mapsTo: 'meta_value',
                    type: "text"
                }
            }, {
                timestamp: true
            })
        } else {
            var fileMetaModel = this.db.coDefine(this.tablePrefix + "file_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                path: {
                    type: "text",
                    size: 640
                },
                key: {
                    type: "text",
                    size: 255
                },
                value: {
                    type: "text"
                }
            }, {
                timestamp: true
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
DBLoader.prototype.defineLinkModel = function() {
    if (this.oldVersion) {
        var linkModel = this.db.coDefine(this.tablePrefix + "share_files", {
            id: {
                type: 'serial',
                key: true
            },
            key: {
                mapsTo: 'share_key',
                type: "text",
                size: 32
            },
            user_id: {
                type: "integer",
                size: 8
            },
            file_id: {
                type: "integer",
                size: 8
            },
            password: {
                type: "text",
                size: 8
            },
            download_count: {
                mapsTo: 'down_count',
                type: "integer",
                size: 8
            },
            expires: {
                mapsTo: 'expiry',
                type: "integer",
                size: 8
            }

        }, {
            timestamp: true
        })
    } else {
        var linkModel = this.db.coDefine(this.tablePrefix + "links", {
            id: {
                type: 'serial',
                key: true
            },
            key: {
                type: "text",
                size: 32
            },
            user_id: {
                type: "integer",
                size: 8
            },
            file_id: {
                type: "integer",
                size: 8
            },
            password: {
                type: "text",
                size: 8
            },
            download_count: {
                type: "integer",
                size: 8
            },
            expires: {
                type: "integer",
                size: 8
            }

        }, {
            timestamp: true
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
DBLoader.prototype.defineVersionModel = function() {
        if (this.oldVersion) {
            var versionModel = this.db.coDefine(this.tablePrefix + "file_versions", {
                id: {
                    type: 'serial',
                    key: true
                },
                signature: {
                    mapsTo: 'file_signature',
                    type: "text",
                    size: 64
                },
                size: {
                    mapsTo: "file_size",
                    type: "integer",
                    size: 8
                },
                ref_count: {
                    type: "integer",
                    size: 4
                },
                mime_type: {
                    type: "text",
                    size: 64
                }
            }, {
                timestamp: true
            })
        } else {
            var versionModel = this.db.coDefine(this.tablePrefix + "versions", {
                id: {
                    type: 'serial',
                    key: true
                },
                signature: {
                    type: "text",
                    size: 64
                },
                size: {
                    type: "integer",
                    size: 8
                },
                ref_count: {
                    type: "integer",
                    size: 4
                },
                mime_type: {
                    type: "text",
                    size: 64
                }
            }, {
                timestamp: true
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
DBLoader.prototype.defineVersionMetaModel = function() {
        if (this.oldVersion) {
            var versionMetaModel = this.db.coDefine(this.tablePrefix + "file_version_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                version_id: {
                    type: "integer",
                    size: 8
                },
                key: {
                    mapsTo: "meta_key",
                    type: "text",
                    size: 255
                },
                value: {
                    mapsTo: "meta_value",
                    type: "text"
                }
            }, {
                timestamp: true
            })
        } else {
            var versionMetaModel = this.db.coDefine(this.tablePrefix + "version_metas", {
                id: {
                    type: 'serial',
                    key: true
                },
                version_id: {
                    type: "integer",
                    size: 8
                },
                key: {
                    type: "text",
                    size: 255
                },
                value: {
                    type: "text"
                }
            }, {
                timestamp: true
            })
        }
        this.versionMetaModel = versionMetaModel
        this.models.push(versionMetaModel)
    }
    /**
     * init table minicloud_choosers.
     * 
     * @api private
     */
DBLoader.prototype.defineChooserModel = function() {
        var chooserModel = this.db.coDefine(this.tablePrefix + "choosers", {
            id: {
                type: 'serial',
                key: true
            },
            name: {
                type: "text",
                size: 64
            },
            app_key: {
                type: "text",
                size: 128
            },
            type: {
                type: "integer",
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
DBLoader.prototype.defineChooserDomainModel = function() {
        var chooserDomainModel = this.db.coDefine(this.tablePrefix + "chooser_domains", {
            id: {
                type: 'serial',
                key: true
            },
            chooser_id: {
                type: "integer",
                size: 8
            },
            domain: {
                type: "text",
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
DBLoader.prototype.defineChooserLinkModel = function() {
        var chooserLinkModel = this.db.coDefine(this.tablePrefix + "chooser_links", {
            id: {
                type: 'serial',
                key: true
            },
            link_id: {
                type: "integer",
                size: 8
            },
            app_key: {
                type: "text",
                size: 32
            },
            session: {
                type: "text",
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
DBLoader.prototype.defineChooserSelectFileModel = function() {
        var chooserSelectFileModel = this.db.coDefine(this.tablePrefix + "chooser_select_files", {
            id: {
                type: 'serial',
                key: true
            },
            user_id: {
                type: "integer",
                size: 8
            },
            file_key: {
                type: "text",
                size: 255
            },
            file_ids: {
                type: "text",
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
DBLoader.prototype.defineEventModel = function() {
        if (this.oldVersion) {
            var eventModel = this.db.coDefine(this.tablePrefix + "events", {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    mapsTo: 'event_uuid',
                    type: "text",
                    size: 64
                },
                type: {
                    type: "integer",
                    size: 2
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                device_id: {
                    mapsTo: 'user_device_id',
                    type: "integer",
                    size: 8
                },
                action: {
                    type: "integer",
                    size: 2
                },
                path: {
                    mapsTo: 'file_path',
                    type: "text",
                    size: 255
                },
                context: {
                    type: "text"
                }
            }, {
                timestamp: true
            })
        } else {
            var eventModel = this.db.coDefine(this.tablePrefix + "events", {
                id: {
                    type: 'serial',
                    key: true
                },
                uuid: {
                    type: "text",
                    size: 64
                },
                type: {
                    type: "integer",
                    size: 2,
                    defaultValue: 1
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                device_id: {
                    type: "integer",
                    size: 8
                },
                action: {
                    type: "integer",
                    size: 2
                },
                path: {
                    type: "text",
                    size: 255
                },
                context: {
                    type: "text"
                }
            }, {
                timestamp: true
            })
        }

        this.eventModel = eventModel
        this.models.push(eventModel)
    }
    /**
     * init table minicloud_options.
     * 
     * @api private
     */
DBLoader.prototype.defineOptionModel = function() {
        if (this.oldVersion) {
            var optionModel = this.db.coDefine(this.tablePrefix + "options", {
                id: {
                    mapsTo: 'option_id',
                    type: 'serial',
                    key: true
                },
                name: {
                    mapsTo: 'option_name',
                    type: "text",
                    size: 64
                },
                value: {
                    mapsTo: 'option_value',
                    type: "text"
                }
            }, {
                timestamp: true
            })
        } else {
            var optionModel = this.db.coDefine(this.tablePrefix + "options", {
                id: {
                    type: 'serial',
                    key: true
                },
                name: {
                    type: "text",
                    unique: true,
                    size: 64
                },
                value: {
                    type: "text"
                }
            }, {
                timestamp: true
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
DBLoader.prototype.defineAppModel = function() {
        if (this.oldVersion) {
            var appModel = this.db.coDefine(this.tablePrefix + "clients", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                name: {
                    mapsTo: 'client_name',
                    type: "text",
                    size: 255
                },
                client_id: {
                    type: "text",
                    unique: true,
                    size: 32
                },
                secret: {
                    mapsTo: 'client_secret',
                    type: "text",
                    size: 64
                },
                redirect_uri: {
                    type: "text",
                    size: 255
                },
                enabled: {
                    type: "boolean",
                    defaultValue: true
                },
                description: {
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
            })
        } else {
            var appModel = this.db.coDefine(this.tablePrefix + "apps", {
                id: {
                    type: 'serial',
                    key: true
                },
                user_id: {
                    type: "integer",
                    size: 8
                },
                name: {
                    type: "text",
                    unique: true,
                    size: 64
                },
                client_id: {
                    type: "text",
                    unique: true,
                    size: 64
                },
                secret: {
                    type: "text",
                    size: 64
                },
                redirect_uri: {
                    type: "text",
                    size: 255
                },
                enabled: {
                    type: "boolean",
                    defaultValue: true
                },
                description: {
                    type: "text",
                    size: 255
                }
            }, {
                timestamp: true
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
DBLoader.prototype.defineTokenModel = function() {
        var tokenModel = this.db.coDefine(this.tablePrefix + "oauth_access_tokens", {
            id: {
                type: 'serial',
                key: true
            },
            access_token: {
                type: "text",
                unique: true,
                size: 128
            },
            client_id: {
                type: "text",
                size: 128
            },
            user_id: {
                type: "integer",
                size: 8
            },
            expires: {
                type: "integer",
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
DBLoader.prototype.defineRefreshTokenModel = function() {
    var refreshTokenModel = this.db.coDefine(this.tablePrefix + "oauth_refresh_tokens", {
        id: {
            type: 'serial',
            key: true
        },
        refresh_token: {
            type: "text",
            unique: true,
            size: 128
        },
        client_id: {
            type: "text",
            size: 128
        },
        user_id: {
            type: "integer",
            size: 8
        },
        expires: {
            type: "integer",
            size: 8
        }
    }, {
        timestamp: true
    })
    this.refreshTokenModel = refreshTokenModel
    this.models.push(refreshTokenModel)
}

/**
 * init table minicloud_log.
 * 
 * @api private
 */
DBLoader.prototype.defineLogModel = function() {
    var logModel = this.db.coDefine(this.tablePrefix + "log", {
        id: {
            type: 'serial',
            key: true
        },
        type: {
            type: "integer",
            size: 2
        },
        user_id: {
            type: "integer",
            size: 8
        },
        message: {
            type: "text",
            size: 128
        },
        context: {
            type: "text",
            size: 128
        },
        is_deleted: {
            type: "integer",
            size: 2
        }
    }, {
        timestamp: true
    })
    this.logModel = logModel
    this.models.push(logModel)
}

/**
 * Return database connect,support yield.
 *
 * @return {Object}
 * @api public
 */
module.exports = function(opts) {
    return function(done) {
        var dbLoader = new DBLoader(opts)
        dbLoader.connect(function(err, db) {
            if (err) {
                return done(err, null)
            }
            return done(null, db)
        })
    }
}
