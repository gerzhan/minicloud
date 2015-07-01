/**
 * 获得页面初始内容，pagePath是页面的相对路径
 */
var md5 = require('MD5');
var request = require('co-request')
var file = require('co-fs-plus')

module.exports.getPageContent = function*(pagePath) {
    var context = global.appContext
    var serverPattern = context.server_pattern
    var appConfig = context[serverPattern]
    if (serverPattern == "mix_cloud") {
      return yield getMixCloudContent(appConfig, pagePath)
    }
    else if (serverPattern == "tiny_cloud") {
      return yield getTinyCloudContent(appConfig, pagePath)
    }else if (serverPattern == "private_cloud") {
      return yield getPrivateCloudContent(appConfig, pagePath)
    }
  }
  /**
   * mixCloud模式下获得页面内容
   * 该模式通过发送请求到http://static.minicloud.io获得APP入口代码
   */
function* getMixCloudContent(config, pagePath) {
  var url = config.static_host + pagePath + "?version=" + config.version
  var redisKey = md5(url)
    //优先从redis获得页面内容
  var redis = global.redisClient
  var body = yield redis.get(redisKey)
  if (body == null || global.debug) {
    //然后请求远程服务器，获得页面内容
    var result = yield request(url);
    body = result.body
    yield redis.set(redisKey, body)
  }
  return body
}

 /**
   * tinyCloud模式下获得页面内容
   * 该模式通过发送请求到/usr/local/miniyun/static.minicloud.io获得APP入口代码
   */
function* getTinyCloudContent(config, pagePath) {
  var filePath = config.static_root_path + pagePath
  var redisKey = md5(filePath + "?version=" + config.version)
    //优先从redis获得页面内容
  var redis = global.redisClient
  var body = yield redis.get(redisKey)
  if (body == null || global.debug) { 
    //然后请求远程服务器，获得页面内容
    body = yield file.readFile(filePath)
    body = body.toString() 
    yield redis.set(redisKey, body)
  }
  return body
}

/**
   * privateCloud模式下获得页面内容
   * 该模式通过发送请求到/usr/local/miniyun/miniyun/statics获得APP入口代码
   */
function* getPrivateCloudContent(config, pagePath) {
  var filePath = config.static_root_path + pagePath
  var redisKey = md5(filePath + "?version=" + config.version)
    //优先从redis获得页面内容
  var redis = global.redisClient
  var body = yield redis.get(redisKey)
  if (body == null || global.debug) { 
    //然后请求远程服务器，获得页面内容
    body = yield file.readFile(filePath)
    body = body.toString() 
    yield redis.set(redisKey, body)
  }
  return body
}