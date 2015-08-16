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
            logging:false
        })
        self.db = sequelize
            //user
        self.defineUserModel()
        self.defineUserPrivilegeModel()
        self.defineUserMetaModel()
            //device
        self.defineDeviceModel()
        self.defineOnlineDeviceModel()
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
