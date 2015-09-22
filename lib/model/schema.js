var Sequelize = require('sequelize')
    /**
     * return all table  schemas
     * @param {String} tablePrefix 
     * @return {Array}  
     * @api public
     */
exports.getSchemas = function(tablePrefix) {
        var data = {}
        data[tablePrefix + 'users'] = _getUserTableSchame()
        data[tablePrefix + 'user_privileges'] = _getUserPrivilegeTableSchame()
        data[tablePrefix + 'user_metas'] = _getUserMetaTableSchame()
        data[tablePrefix + 'events'] = _getEventTableSchame()
        return data
    }
    /**
     * return table  extend attributes 
     * @return {Array}  
     * @api public
     */
var _getExtend = function() {
        return {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8',
            engine: 'MYISAM'
        }
    }
    /**
     * return minicloud_users schema
     * @return {Object}  
     * @api public
     */
var _getUserTableSchame = function(tablePrefix) {
        var tableName = tablePrefix + 'users'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                type: Sequelize.STRING(64)
            },
            name: {
                type: Sequelize.STRING(256)
            },
            password: {
                type: Sequelize.STRING(256)
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            salt: {
                type: Sequelize.STRING(6)
            },
            detail: {
                type: Sequelize.STRING(256)
            },
            role: {
                type: Sequelize.INTEGER
            },
            department_path: {
                type: Sequelize.STRING(1024)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['uuid']
            }, {
                unique: true,
                colums: ['name']
            }, {
                unique: false,
                colums: ['department_path']
            }, {
                unique: false,
                colums: ['detail']
            }]
        }
    }
    /**
     * return minicloud_user_privileges schema
     * @return {Object}  
     * @api public
     */
var _getUserPrivilegeTableSchame = function(tablePrefix) {
        var tableName = tablePrefix + 'user_privileges'
        var columns = {
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
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['file_path']
            }, {
                colums: ['user_id']
            }]
        }
    }
    /**
     * return minicloud_user_metas schema
     * @return {Object}  
     * @api public
     */
var _getUserMetaTableSchame = function(tablePrefix) {
        var tableName = tablePrefix + 'user_metas'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            key: {
                type: Sequelize.STRING(255)
            },
            value: {
                type: Sequelize.TEXT
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['user_id', 'key']
            }, {
                colums: ['user_id']
            }]
        }
    }
    /**
     * return minicloud_events schema
     * @return {Object}  
     * @api public
     */
var _getEventTableSchame = function(tablePrefix) {
    //type=1 login event,context={}
    //type=2 logout event,context={}
    //type=4 file create,context={file_type:0/1}
    //type=8 file move,context={file_type:0/1,from_name,'abc'}
    //type=16 file fake context={file_type:0/1,descendant_count:1}
    //type=32 file clean
    //type=64 file download
    //type=128 file view
    var tableName = tablePrefix + 'events'
    var columns = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: Sequelize.INTEGER
        },
        user_id: {
            type: Sequelize.INTEGER
        },
        device_id: {
            type: Sequelize.INTEGER
        },
        device_name: {
            type: Sequelize.STRING(64)
        },
        client_id: {
            type: Sequelize.STRING(64)
        },
        ip: {
            type: Sequelize.STRING(64)
        },
        path_lower: {
            type: Sequelize.STRING(256)
        },
        context: {
            type: Sequelize.TEXT
        }
    }
    return {
        columns: columns,
        extend: _getExtend(),
        indexs: [{
            colums: ['user_id', 'type']
        }, {
            colums: ['device_id']
        }]
    }
}
