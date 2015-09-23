 var path = require('path')
 var fs = require('fs')
 var exec = require('child_process').exec
 var _getDBConfig = function() {
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
     return dbConfig
 }
 var _getMigrationConfigPath = function(dbConfig) {
         if (!dbConfig) {
             dbConfig = _getDBConfig()
         }
         var migrationConfig = {
                 production: dbConfig
             }
             //save config
         var configPath = path.resolve(process.cwd(), './migration-config.json')
         fs.writeFileSync(configPath, JSON.stringify(migrationConfig))
         return configPath
     }
     /**
      * run migration   
      * @api public
      */
 exports.run = function(dbConfig) {
         var configPath = _getMigrationConfigPath(dbConfig)
             //run migration
         var migrationPath = path.resolve(__dirname, './model/migrations')
         var binPath = path.resolve(__dirname, '../node_modules/sequelize-cli/bin/sequelize')
         binPath += ' db:migrate '
         binPath += ' --migrations-path=' + migrationPath + ' '
         binPath += ' --config=' + configPath + ' '
         binPath += ' --env=production '
         console.log(binPath)
         return function(done) {
             exec(binPath, function(error, stdout, stderr) {
                 console.log(stdout)
                 require('co').wrap(function*() {
                     //init app data
                     var dbConfig = require(configPath)[process.env.NODE_ENV || 'production']
                     global.sequelizePool = yield require('./loader/sequelize-loader')(dbConfig)

                     if (stdout.indexOf('20150922103225-v0.5.x-migration: migrated') > 0) {
                         yield _initAppData20150922103225()
                     }
                     //clean config file
                     fs.unlinkSync(configPath)
                     done(null, null)
                 })()

             })
         }
     }
     /**
      * init App Data
      * @param {Object} dbConfig   
      * @api private
      */
 var _initAppData20150922103225 = function*() {
     var MiniApp = require('./model/app')
     var MiniUser = require('./model/user')
     yield MiniApp.create(-1, 'official web client', 'JsQCsjF3yr7KACyT', 'bqGeM4Yrjs3tncJZ', '', 1, 'official web client')
     yield MiniApp.create(-1, 'official windows desktop client', 'd6n6Hy8CtSFEVqNh', 'e6yvZuKEBZQe9TdA', '', 1, 'official windows desktop client')
     yield MiniApp.create(-1, 'official mac desktop client', 'c9Sxzc47pnmavzfy', '9ZQ4bsxEjBntFyXN', '', 1, 'official mac desktop client')
     yield MiniApp.create(-1, 'official linux desktop client', 'V8G9svK8VDzezLum', 'waACXBybj9QXhE3a', '', 1, 'official linux desktop client')
     yield MiniApp.create(-1, 'official android client', 'MsUEu69sHtcDDeCp', '5ABU5XPzsR6tTxeK', '', 1, 'official android client')
     yield MiniApp.create(-1, 'official iphone/ipad client', 'UmxT6CuwQYrtJGFp', 'GxsxayamApUSwTq9', '', 1, 'official iphone/ipad client')
     yield MiniUser.create('admin', 'admin', 9)
 }
