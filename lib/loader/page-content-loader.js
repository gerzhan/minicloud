/**
 * 获得页面初始内容，pagePath是页面的相对路径
 */
var md5 = require('MD5');
var request = require('co-request')
module.exports.getPageContent = function*(pagePath) {
    var context = global.appContext
    var serverPattern = context.server_pattern
    var appConfig = context[serverPattern]
    if (serverPattern == "mix_cloud") {
      return yield getMixCloudContent(appConfig, pagePath)
    }

  }
  /**
   * 混合云模式下获得页面内容
   * 该模式通过发送请求到http://static.minicloud.io获得APP入口代码
   * 
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