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
 * db config first env.ORM_PROTOCOL,then config.json follow mysql,postgres,redshift,mongodb,sqlite
 * @api private
 */
DBLoader.prototype.setDBConfig = function() {
        var opts = this.config
        var protocol = process.env.ORM_PROTOCOL
        var dbConfig = opts[protocol]

        var util = require('util')
        var connectionString = ''
        switch (protocol) {
            case 'mysql':
            case 'postgres':
            case 'redshift':
            case 'mongodb':
                connectionString = util.format('%s://%s:%s@%s:%d/%s',
                    protocol, dbConfig.user, dbConfig.password,
                    dbConfig.host, dbConfig.port, dbConfig.database
                ).replace(':@', '@')
                break

        }
        this.connectionString = connectionString
        this.tablePrefix = dbConfig['table_prefix'] || 'minicloud_'
        global.tablePrefix = this.tablePrefix
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

            if (global.testModel) {
                db.settings.set('instance.cache', false)
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
             
                
               
                //other
            self.defineOptionModel()
            self.defineAppModel()
            self.defineTokenModel()
            self.defineRefreshTokenModel()
            self.defineCursorModel()
            cb(err, self)
        });
    }
      
    
    /**
     * init table minicloud_options.
     * 
     * @api private
     */
DBLoader.prototype.defineOptionModel = function() {
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
DBLoader.prototype.defineAppModel = function() {
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
DBLoader.prototype.defineTokenModel = function() {
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
DBLoader.prototype.defineRefreshTokenModel = function() {
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
DBLoader.prototype.defineCursorModel = function() {
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
        var dbLoader = new DBLoader(opts)
        dbLoader.connect(function(err, db) {
            return done(null, db)
        })
    }
}
