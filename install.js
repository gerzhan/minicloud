var cli = require('cli')
cli.parse({
    config: [false, 'Config path', 'path', './config.json']
})
cli.main(function(args, options) {
    var config = require(options.config)
    var migration = require('./lib/migration')
    require('co').wrap(function*() {
        yield migration.run(config.database)
    })()
})
