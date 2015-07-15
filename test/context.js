var appConfig = require("../config.json")
var config = appConfig[process.env.NODE_ENV]
exports.config = config
