var path = require('path')
var cli = require('cli')
cli.parse({
    config: [false, 'Config path', 'path', './config.json']
})
cli.main(function(args, options) { 
	var configPath = path.resolve(process.cwd(), options.config)
    var config = require(configPath)
    var migration = require('./lib/migration')
    require('co').wrap(function*() {
        yield migration.run(config.database)
    })()
})