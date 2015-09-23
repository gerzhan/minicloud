var Sequelize = require('sequelize')
    /**
     * return all table  schemas
     * @param {String} tablePrefix 
     * @return {Array}  
     * @api private
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
        data[tablePrefix + 'file_version_metas'] = _getFileVersionMetaTableSchame()
        data[tablePrefix + 'tags'] = _getTagTableSchame()
        data[tablePrefix + 'file_tag_relations'] = _getFileTagRelationTableSchame()
        data[tablePrefix + 'choosers'] = _getChoosersTableSchame()
        data[tablePrefix + 'chooser_domains'] = _getChoosersDomainTableSchame()
        data[tablePrefix + 'chooser_links'] = _getChooserLinkTableSchame()
        data[tablePrefix + 'chooser_select_files'] = _getChooserSelectFileTableSchame()
        data[tablePrefix + 'doc_nodes'] = _getDocNodeTableSchame()
        data[tablePrefix + 'search_nodes'] = _getSearchNodeTableSchame()
        data[tablePrefix + 'search_files'] = _getSearchFileTableSchame()
        data[tablePrefix + 'search_build_tasks'] = _getSearchBuildTaskTableSchame()
        data[tablePrefix + 'store_nodes'] = _getStoreNodeTableSchame()
        data[tablePrefix + 'options'] = _getOptionTableSchame()
        data[tablePrefix + 'clients'] = _getClientTableSchame()
        data[tablePrefix + 'oauth_access_tokens'] = _getTokenTableSchame()
        data[tablePrefix + 'oauth_refresh_tokens'] = _getRefreshTokenTableSchame()
        data[tablePrefix + 'cursors'] = _getCursorTableSchame()
        return data
    }
    /**
     * return table  extend attributes 
     * @return {Array}  
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
     * @api private
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
    /**
     * return minicloud_file_version_metas schema
     * @return {Object}  
     * @api private
     */
var _getFileVersionMetaTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'file_version_metas'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            version_id: {
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
                colums: ['version_id', 'key']
            }]
        }
    }
    /**
     * return minicloud_tags schema
     * @return {Object}  
     * @api private
     */
var _getTagTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'tags'
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
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['user_id', 'name']
            }, {
                colums: ['user_id']
            }]
        }
    }
    /**
     * return minicloud_file_tag_relations schema
     * @return {Object}  
     * @api private
     */
var _getFileTagRelationTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'file_tag_relations'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            tag_id: {
                type: Sequelize.INTEGER
            },
            file_id: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                unique: true,
                colums: ['tag_id', 'file_id']
            }, {
                colums: ['tag_id']
            }, {
                colums: ['file_id']
            }]
        }
    }
    /**
     * return minicloud_choosers schema
     * @return {Object}  
     * @api private
     */
var _getChoosersTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'choosers'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(64)
            },
            app_key: {
                type: Sequelize.STRING(128)
            },
            type: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['name']
            }, {
                colums: ['app_key']
            }]
        }
    }
    /**
     * return minicloud_chooser_domains schema
     * @return {Object}  
     * @api private
     */
var _getChoosersDomainTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'chooser_domains'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            chooser_id: {
                type: Sequelize.INTEGER
            },
            domain: {
                type: Sequelize.STRING(255)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['chooser_id']
            }]
        }
    }
    /**
     * return minicloud_chooser_links schema
     * @return {Object}  
     * @api private
     */
var _getChooserLinkTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'chooser_links'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            link_id: {
                type: Sequelize.INTEGER
            },
            app_key: {
                type: Sequelize.STRING(32)
            },
            session: {
                type: Sequelize.STRING(32)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['session']
            }]
        }
    }
    /**
     * return minicloud_chooser_select_files schema
     * @return {Object}  
     * @api private
     */
var _getChooserSelectFileTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'chooser_select_files'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            file_key: {
                type: Sequelize.STRING(64)
            },
            file_ids: {
                type: Sequelize.STRING(255)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['file_key']
            }]
        }
    }
    /**
     * return minicloud_doc_nodes schema
     * @return {Object}  
     * @api private
     */
var _getDocNodeTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'doc_nodes'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            host: {
                type: Sequelize.STRING(128)
            },
            safe_code: {
                type: Sequelize.STRING(128)
            },
            status: {
                type: Sequelize.INTEGER
            },
            converted_file_count: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['name']
            }]
        }
    }
    /**
     * return minicloud_search_nodes schema
     * @return {Object}  
     * @api private
     */
var _getSearchNodeTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'search_nodes'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            host: {
                type: Sequelize.STRING(128)
            },
            safe_code: {
                type: Sequelize.STRING(128)
            },
            status: {
                type: Sequelize.INTEGER
            },
            build_file_count: {
                type: Sequelize.INTEGER
            },
            search_count: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['name']
            }]
        }
    }
    /**
     * return minicloud_search_files schema
     * @return {Object}  
     * @api private
     */
var _getSearchFileTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'search_files'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(64)
            },
            node_ids: {
                type: Sequelize.STRING(128)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['hash']
            }]
        }
    }
    /**
     * return minicloud_search_build_tasks schema
     * @return {Object}  
     * @api private
     */
var _getSearchBuildTaskTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'search_build_tasks'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            hash: {
                type: Sequelize.STRING(64)
            },
            node_id: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['hash']
            }]
        }
    }
    /**
     * return minicloud_store_nodes schema
     * @return {Object}  
     * @api private
     */
var _getStoreNodeTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'store_nodes'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(128)
            },
            host: {
                type: Sequelize.STRING(128)
            },
            safe_code: {
                type: Sequelize.STRING(128)
            },
            status: {
                type: Sequelize.BOOLEAN
            },
            saved_file_count: {
                type: Sequelize.INTEGER
            },
            downloaded_file_count: {
                type: Sequelize.INTEGER
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['name']
            }]
        }
    }
    /**
     * return minicloud_options schema
     * @return {Object}  
     * @api private
     */
var _getOptionTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'options'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
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
                colums: ['key']
            }]
        }
    }
    /**
     * return minicloud_clients schema
     * @return {Object}  
     * @api private
     */
var _getClientTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'clients'
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
                type: Sequelize.STRING(255)
            },
            client_id: {
                type: Sequelize.STRING(32)
            },
            secret: {
                type: Sequelize.STRING(64)
            },
            redirect_uri: {
                type: Sequelize.STRING(255)
            },
            enabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            description: {
                type: Sequelize.STRING(255)
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['client_id']
            }]
        }
    }
    /**
     * return minicloud_oauth_access_tokens schema
     * @return {Object}  
     * @api private
     */
var _getTokenTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'oauth_access_tokens'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            access_token: {
                type: Sequelize.STRING(128)
            },
            client_id: {
                type: Sequelize.STRING(128)
            },
            device_id: {
                type: Sequelize.INTEGER
            },
            expires: {
                type: Sequelize.BIGINT
            }
        }
        return {
            columns: columns,
            extend: _getExtend(),
            indexs: [{
                colums: ['access_token']
            }]
        }
    }
    /**
     * return minicloud_oauth_refresh_tokens schema
     * @return {Object}  
     * @api private
     */
var _getRefreshTokenTableSchame = function(tablePrefix) {

        var tableName = tablePrefix + 'oauth_refresh_tokens'
        var columns = {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            refresh_token: {
                type: Sequelize.STRING(128)
            },
            client_id: {
                type: Sequelize.STRING(128)
            },
            device_id: {
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
                colums: ['refresh_token']
            }]
        }
    }
    /**
     * return minicloud_cursors schema
     * @return {Object}  
     * @api private
     */
var _getCursorTableSchame = function(tablePrefix) {

    var tableName = tablePrefix + 'cursors'
    var columns = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        cursor: {
            type: Sequelize.STRING(64)
        },
        value: {
            type: Sequelize.INTEGER
        }
    }
    return {
        columns: columns,
        extend: _getExtend(),
        indexs: [{
            unique: true,
            colums: ['cursor']
        }]
    }
}
