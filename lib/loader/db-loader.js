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
 * db config first env.ORM_PROTOCOL,then config.json follow mysql,postgres,redshift,mongodb,sqlite
 * @api private
 */
DBLoader.prototype.setDbConfig = function() {
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
        var connectionString = ""
        if (protocol == 'mysql') {
            connectionString = "mysql://" + dbConfig.user_name + ":" + dbConfig.password + "@" + dbConfig.host + ":" + dbConfig.port + "/" + dbConfig.db_name
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
        self.setDbConfig()
        orm.coConnect(self.connectionString, function(err, db) {
            if (err) {
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
            self.defineUserDeviceModel()
            self.defineUserDeviceMetaModel()
            self.defineClientModel()
            self.defineTokenModel()
            self.defineRefreshTokenModel()
            cb(err, self)
        });
    }
    /**
     * init table miniyun_users.
     * 
     * @api private
     */
DBLoader.prototype.defineUserModel = function() {
        var userModel = this.db.coDefine("miniyun_users", {
            id: Number,
            user_uuid: String,
            user_name: String,
            user_pass: String,
            user_status: Number,
            salt: String,
            user_name_pinyin: String
        }, {
            timestamp: true
        })
        this.userModel = userModel
        this.models.push(userModel)
    }
    /**
     * init table miniyun_user_metas.
     * 
     * @api private
     */
DBLoader.prototype.defineUserMetaModel = function() {
        var usermetaModel = this.db.coDefine(this.tablePrefix + "user_metas", {
            id: Number,
            user_id: Number,
            meta_key: String,
            meta_value: String
        }, {
            timestamp: true
        })
        this.usermetaModel = usermetaModel
        this.models.push(usermetaModel)
    }
    /**
     * init table miniyun_groups.
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
     * init table miniyun_group_relations.
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
     * init table miniyun_user_group_relations.
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
     * init table miniyun_user_devices.
     * 
     * @api private
     */
DBLoader.prototype.defineUserDeviceModel = function() {
        var userDeviceModel = this.db.coDefine(this.tablePrefix + "user_devices", {
            id: Number,
            user_device_uuid: String,
            user_id: Number,
            user_device_type: Number,
            user_device_name: String,
            user_device_info: String
        }, {
            timestamp: true
        })
        this.userDeviceModel = userDeviceModel
        this.models.push(userDeviceModel)
    }
    /**
     * init table miniyun_user_devices_metas.
     * 
     * @api private
     */
DBLoader.prototype.defineUserDeviceMetaModel = function() {
        var userMetaDeviceModel = this.db.coDefine(this.tablePrefix + "user_devices_metas", {
            id: Number,
            user_id: Number,
            device_id: Number,
            meta_name: String,
            meta_value: String
        }, {
            timestamp: true
        })
        this.userMetaDeviceModel = userMetaDeviceModel
        this.models.push(userMetaDeviceModel)
    }
    /**
     * init table miniyun_clients.
     * 
     * @api private
     */
DBLoader.prototype.defineClientModel = function() {
        var clientModel = this.db.coDefine(this.tablePrefix + "clients", {
            id: Number,
            user_id: Number,
            client_name: String,
            client_id: String,
            client_secret: String,
            redirect_uri: String,
            enabled: Number,
            description: String
        }, {
            timestamp: true
        })
        this.clientModel = clientModel
        this.models.push(clientModel)
    }
    /**
     * init table oauth_access_tokens.
     * 
     * @api private
     */
DBLoader.prototype.defineTokenModel = function() {
        var tokenModel = this.db.coDefine("oauth_access_tokens", {
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
     * init table oauth_refresh_tokens.
     * 
     * @api private
     */
DBLoader.prototype.defineRefreshTokenModel = function() {
        var refreshTokenModel = this.db.coDefine("oauth_refresh_tokens", {
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
