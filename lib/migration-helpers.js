var path = require('path')
var fs = require('fs')
    /**
     * Return table prefix  
     * @return {String}    
     * @api public
     */
exports.getTablePrefix = function() {
        var prefix = 'minicloud_'
        var configPath = path.resolve(process.cwd(), './config.json')
        if (fs.existsSync(configPath)) {
            var config = require(configPath) || {}
            var dbConfig = config.database || {}
            prefix = dbConfig.table_prefix || prefix
        }
        return prefix
    }
    /**
     * create table   
     * @param {Object} migration    
     * @param {Object} schema
     * @param {String} tableName
     * @api public
     */
exports.createTable = function(migration, schema, tableName) {
    var currentSchema = schema[tableName]
    migration.createTable(tableName, currentSchema.columns, currentSchema.extend)
    var indexs = currentSchema.indexs
    for (var i = 0; i < indexs.length; i++) {
        var indexItem = indexs[i]
        var indexName = tableName + '_'
        var indexColumns = indexItem.colums
        for (var j = 0; j < indexColumns.length; j++) {
            indexName += indexColumns[j] + '_'
        }
        indexName += 'index'
        if (indexItem.unique) {
            migration.addIndex(
                tableName, indexItem.colums, {
                    indexName: indexName,
                    indicesType: 'UNIQUE'
                }
            )
        } else {
            migration.addIndex(
                tableName, indexItem.colums, {
                    indexName: indexName
                }
            )
        }
    }
}
