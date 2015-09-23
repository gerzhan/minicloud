var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var Sequelize = require('sequelize')
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
        currentSchema.columns['created_at'] = Sequelize.DATE
        currentSchema.columns['updated_at'] = Sequelize.DATE
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
    /**
     * migration   
     * @api public
     */
exports.migration = function(dbConfig, done) {
    if (!dbConfig) {
        var configPath = path.resolve(process.cwd(), 'config.json')
        var dbConfig = {
            storage: path.resolve(process.cwd(), './minicloud.db'),
            dialect: 'sqlite'
        }
        if (fs.existsSync(configPath)) {
            var config = require(configPath)
            if (config) {
                var database = config.database
                if (database) {
                    dbConfig = database
                }
            }
        }
    }
    var migrationConfig = {
        development: dbConfig,
        test: dbConfig,
        production: dbConfig
    }

    //save config
    var configPath = path.resolve(process.cwd(), './bin/config.json')
    fs.writeFile(configPath, JSON.stringify(migrationConfig), function(error) {
        //run migration
        var migrationPath = path.resolve(process.cwd(), './lib/model/migrations')
        var binPath = path.resolve(process.cwd(), './node_modules/sequelize-cli/bin/sequelize')
        binPath += ' db:migrate '
        binPath += ' --migrations-path=' + migrationPath + ' '
        binPath += ' --config=' + configPath + ' '
        exec(binPath, function(error, stdout, stderr) {
            if (!error) {
                console.log('\n\ndatabase initialize success!\n\n')
            }
            console.log(stdout)
                //remove config file
            fs.unlinkSync(configPath)
            if (done) {
                done(null, null)
            }
        })
    })
}
