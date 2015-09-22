var helpers = require('./migration-helpers')
var tablePrefix = helpers.getTablePrefix()
var schema = require('../schema').getSchemas(tablePrefix)
module.exports = {
    up: function(migration, Sequelize) {
        //create table minicloud_users
        helpers.createTable(migration, schema, tablePrefix + 'users')
            //create table minicloud_user_privileges
        helpers.createTable(migration, schema, tablePrefix + 'user_privileges')
            //create table minicloud_user_metas
        helpers.createTable(migration, schema, tablePrefix + 'user_metas')
            //create table minicloud_events
        helpers.createTable(migration, schema, tablePrefix + 'events')
    },
    down: function(migration, Sequelize) {
        //drop table minicloud_users
        migration.dropTable(tablePrefix + 'users')
            //drop table minicloud_user_privileges
        migration.dropTable(tablePrefix + 'user_privileges')
            //drop table minicloud_user_metas
        migration.dropTable(tablePrefix + 'user_metas')
            //drop table minicloud_events
        migration.dropTable(tablePrefix + 'events')
    }
}
