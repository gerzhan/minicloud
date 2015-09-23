var helpers = require('../../migration-helpers')
var tablePrefix = helpers.getTablePrefix()
var schema = require('../schema').getSchemas(tablePrefix)
var tables = ['users', 'user_privileges', 'user_metas', 'events', 'user_devices', 'online_devices',
    'groups', 'group_privileges', 'user_group_relations', 'departments', 'files', 'file_upload_sessions',
    'file_metas', 'file_links', 'file_versions', 'file_version_metas', 'tags', 'file_tag_relations',
    'choosers', 'chooser_domains', 'chooser_links', 'chooser_select_files'
]
module.exports = {
    up: function(migration, Sequelize) {
        for (var i = 0; i < tables.length; i++) {
            var tableName = tables[i]
            helpers.createTable(migration, schema, tablePrefix + tableName)
        }
    },
    down: function(migration, Sequelize) {
        for (var i = 0; i < tables.length; i++) {
            var tableName = tables[i]
            helpers.dropTable(tablePrefix + tableName)
        }
    }
}
