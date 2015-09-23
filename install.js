var migration = require('./lib/migration')
require('co').wrap(function*() {
    yield migration.run()
})()
