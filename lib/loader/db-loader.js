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
        var userModel = this.db.coDefine(this.tablePrefix+"users", {
            id: Number,
            uuid: String,
            name: String,
            password: String,
            status: Number,
            salt: String
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
            id: Number,
            user_id: Number,
            key: String,
            value: String
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
            id: Number,
            user_id: Number,
            name: String,
            description: String,
            parent_group_id: Number
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
            id: Number,
            group_id: Number,
            parent_group_id: Number
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
            id: Number,
            group_id: Number,
            user_id: Number
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
            id: Number,
            uuid: String,
            user_id: Number,
            type: Number,
            name: String,
            info: String
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
            id: Number,
            device_id: Number,
            name: String,
            value: String
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
            id: Number,
            user_id: Number,
            name: String,
            client_id: String,
            secret: String,
            redirect_uri: String,
            enabled: Number,
            description: String
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
        var tokenModel = this.db.coDefine(this.tablePrefix +"oauth_access_tokens", {
            id: Number,
            access_token: String,
            client_id: String,
            user_id: Number,
            expires: Number
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
        var refreshTokenModel = this.db.coDefine(this.tablePrefix +"oauth_refresh_tokens", {
            id: Number,
            refresh_token: String,
            client_id: String,
            user_id: Number,
            expires: Number
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
