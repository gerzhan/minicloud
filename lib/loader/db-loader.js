'use strict'
/**
 * Module dependencies.
 */
var coOrm = require('co-orm')
var modts = require('orm-timestamps')
var orm = require('orm')
    /**
     * database connect.
     * 
     * @param {String} host
     * @param {Integer} port
     * @param {String} name 
     * @param {String} passwd 
     * @param {String} tablePrefix 
     * @api public
     */
function DBLoader(host, port, name, passwd, dbName, tablePrefix) {
    this.host = host
    this.port = port
    this.name = name
    this.passwd = passwd
    this.dbName = dbName
    this.tablePrefix = tablePrefix || "miniyun_"
}
module.exports = DBLoader
    /**
     * Return database connect.
     *
     * connect database and init orm object for every database table
     * @param {Function} cb
     * @return {Object}
     * @api public
     */
DBLoader.prototype.initDBConnect = function(cb) {
        var self = this
        coOrm.coConnect("mysql://" + self.name + ":" + self.passwd + "@" + self.host + ":" + self.port + "/" + self.dbName, function(err, db) {
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
            self.defineUserModel() //定义用户表:miniyun_users
            self.defineUserMetaModel() //定义用户扩展属性表:miniyun_user_metas
            self.defineGroupModel() //定义群组/部门表:miniyun_groups
            self.defineGroupRelationModel() //定义群组/部门关系表:miniyun_group_relations
            self.defineUserGroupRelationModel() //定义用户与部门关系表:miniyun_user_group_relations
            self.defineUserDeviceModel() //定义用户设备表:miniyun_user_devices
            self.defineUserDeviceMetaModel() //定义用户设备属性表:miniyun_user_device_metas
            self.defineClientModel() //定义client表：miniyun_clients
            self.defineTokenModel() //定义token表：oauth_access_tokens
            self.defineRefreshTokenModel() //定义refresh_token表：oauth_refresh_tokens
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
}
