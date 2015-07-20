'use strict'
/**
 * database connect.
 * Support MySQL & MariaDB/PostgreSQL/Amazon Redshift/SQLite/MongoDB
 * @param {Object} config 
 * @api public
 */
function DBLoader(config) {
    this.config = config
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
            self.defineUserModel()
            self.defineUserMetaModel()
            self.defineGroupModel()
            self.defineGroupRelationModel()
            self.defineUserGroupRelationModel()
            self.defineDeviceModel()
            self.defineDeviceMetaModel()
            self.defineAppModel()
            self.defineTokenModel()
            self.defineRefreshTokenModel()
            cb(err, self)
        });
    }
    /**
     * init table minicloud_users.
     * 
     * @api private
     */
DBLoader.prototype.defineUserModel = function() {
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
        this.userModel = userModel
        this.models.push(userModel)
    }
    /**
     * init table minicloud_user_metas.
     * 
     * @api private
     */
DBLoader.prototype.defineUserMetaModel = function() {
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
        this.userMetaModel = userMetaModel
        this.models.push(userMetaModel)
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
     * init table minicloud_devices.
     * 
     * @api private
     */
DBLoader.prototype.defineDeviceModel = function() {
        var deviceModel = this.db.coDefine(this.tablePrefix + "devices", {
            id: {
                type: 'serial',
                key: true
            },
            uuid: {
                type: "text",
                unique: true,
                size: 32
            },
            user_id: {
                type: "integer",
                size: 8
            },
            type: {
                type: "integer",
                size: 2
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
        this.deviceModel = deviceModel
        this.models.push(deviceModel)
    }
    /**
     * init table minicloud_devices_metas.
     * 
     * @api private
     */
DBLoader.prototype.defineDeviceMetaModel = function() {
        var deviceMetaModel = this.db.coDefine(this.tablePrefix + "devices_metas", {
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
        this.deviceMetaModel = deviceMetaModel
        this.models.push(deviceMetaModel)
    }
    /**
     * init table minicloud_apps.
     * 
     * @api private
     */
DBLoader.prototype.defineAppModel = function() {
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
