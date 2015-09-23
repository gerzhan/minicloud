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
        data[tablePrefix + 'user_devices'] = _getDeviceTableSchame()
        data[tablePrefix + 'online_devices'] = _getOnlineDeviceTableSchame()
        data[tablePrefix + 'groups'] = _getGroupTableSchame()
        data[tablePrefix + 'group_privileges'] = _getGroupPrivilegeTableSchame()
        data[tablePrefix + 'user_group_relations'] = _getUserGroupRelationTableSchame()
        data[tablePrefix + 'departments'] = _getDepartmentsTableSchame()
        data[tablePrefix + 'files'] = _getFileTableSchame()
        data[tablePrefix + 'file_upload_sessions'] = _getFileUploadSessionTableSchame()
        data[tablePrefix + 'file_metas'] = _getFileMetaTableSchame()
        data[tablePrefix + 'file_links'] = _getFileLinkTableSchame()
        data[tablePrefix + 'file_versions'] = _getFileVersionTableSchame()

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
                type: Sequelize.STRING(255)
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
    /**
     * return minicloud_devices schema
     * @return {Object}  
     * @api public
     */
var _getDeviceTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'user_devices'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                type: Sequelize.STRING(32)
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            client_id: {
                type: Sequelize.STRING(64)
            },
            name: {
                type: Sequelize.STRING(255)
            },
            info: {
                type: Sequelize.STRING(255)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['user_id']
            }, {
                unique: true,
                colums: ['uuid']
            }]
        }
    }
    /**
     * return minicloud_online_devices schema
     * @return {Object}  
     * @api public
     */
var _getOnlineDeviceTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'online_devices'
        var columns = {
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
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['user_id']
            }, {
                colums: ['device_id']
            }]
        }
    }
    /**
     * return minicloud_groups schema
     * @return {Object}  
     * @api public
     */
var _getGroupTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'groups'
        var columns = {
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
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['user_id']
            }, {
                colums: ['user_id', 'name']
            }]
        }
    }
    /**
     * return minicloud_group_privileges schema
     * @return {Object}  
     * @api public
     */
var _getGroupPrivilegeTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'group_privileges'
        var columns = {
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
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['group_id', 'file_path']
            }]
        }
    }
    /**
     * return minicloud_user_group_relations schema
     * @return {Object}  
     * @api public
     */
var _getUserGroupRelationTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'user_group_relations'
        var columns = {
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
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['group_id']
            }, {
                colums: ['group_id', 'user_id']
            }]
        }
    }
    /**
     * return minicloud_departments schema
     * @return {Object}  
     * @api public
     */
var _getDepartmentsTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'departments'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            description: {
                type: Sequelize.STRING(255)
            },
            path: {
                type: Sequelize.STRING(255)
            },
            parent_id: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['path']
            }, {
                colums: ['parent_id']
            }]
        }
    }
    /**
     * return minicloud_files schema
     * @return {Object}  
     * @api public
     */
var _getFileTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'files'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.INTEGER
            },
            client_created: {
                type: Sequelize.BIGINT
            },
            client_modified: {
                type: Sequelize.BIGINT
            },
            name: {
                type: Sequelize.STRING(255)
            },
            version_id: {
                type: Sequelize.INTEGER
            },
            size: {
                type: Sequelize.BIGINT
            },
            path_lower: {
                type: Sequelize.STRING(255)
            },
            is_deleted: {
                type: Sequelize.BOOLEAN
            },
            mime: {
                type: Sequelize.STRING(128)
            },
            parent_id: {
                type: Sequelize.INTEGER
            },
            file_name_pinyin: {
                type: Sequelize.STRING(512)
            },
            server_modified: {
                field: 'updated_at',
                type: Sequelize.DATE
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['user_id', 'path_lower']
            }, {
                colums: ['user_id', 'path_lower', 'is_deleted']
            }, {
                colums: ['user_id']
            }]
        }
    }
    /**
     * return minicloud_file_upload_sessions schema
     * @return {Object}  
     * @api public
     */
var _getFileUploadSessionTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'file_upload_sessions'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            session_id: {
                type: Sequelize.STRING(64)
            },
            store_node_id: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['session_id']
            }]
        }
    }
    /**
     * return minicloud_file_metas schema
     * @return {Object}  
     * @api public
     */
var _getFileMetaTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'file_metas'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            path: {
                type: Sequelize.STRING(640)
            },
            key: {
                type: Sequelize.STRING(64)
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
                colums: ['path', 'key']
            }]
        }
    }
    /**
     * return minicloud_file_links schema
     * @return {Object}  
     * @api public
     */
var _getFileLinkTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'file_links'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            key: {
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
                type: Sequelize.INTEGER
            },
            expires: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['key']
            }]
        }
    }
    /**
     * return minicloud_file_versions schema
     * @return {Object}  
     * @api public
     */
var _getFileVersionTableSchame = function(tablePrefix) {

    var tableName = tablePrefix + 'file_versions'
    var columns = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        hash: {
            type: Sequelize.STRING(64)
        },
        size: {
            type: Sequelize.BIGINT
        },
        ref_count: {
            type: Sequelize.INTEGER
        },
        doc_convert_status: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        replicate_status: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    }
    return {
        columns: columns,
        extend: _getExtend(),
        indexs: [{
            unique: true,
            colums: ['hash']
        }]
    }
}
