/**
 * Module dependencies.
 */
var co = require('co')
var config = require("./config.json")
process.env.ORM_PROTOCOL = process.env.ORM_PROTOCOL || 'mysql'
    //start app 
co.wrap(function*() {
    var app = yield require("./lib/loader/app-loader")(config)
    app.listen(config.port)
    console.log(config.port + " is running!")
})()