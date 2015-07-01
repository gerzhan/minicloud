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
    } else if (serverPattern == "tiny_cloud") {
      return yield getTinyCloudContent(appConfig, pagePath)
    } else if (serverPattern == "private_cloud") {
      return yield getPrivateCloudContent(appConfig, pagePath)
    }
  }
  /**
   * 把迷你云服务器信息写入到页面模板中
   */
function* merge(body) {
    var content = body + "<script>\n" +
      "var miniHost = 'http://service.minicloud.io'\n" +
      "var staticHost = 'http://static.minicloud.io'\n" +
      "var apiVersion = 'v1'\n" +
      "var miniContext = {\n" +
      "  miniHost:miniHost,\n" +
      "  apiHost:miniHost+\"/api/\"+apiVersion,\n" +
      "  staticHost:staticHost\n" +
      "}\n" +
      "angular.module(\"miniCloud\").constant('miniContext', miniContext)\n" +
      "</script>"
    return content
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
  return yield merge(body)
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
  return yield merge(body)
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
  return yield merge(body)
}