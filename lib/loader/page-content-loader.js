/**
 * 远程获得页面内容，优先获得redis中内容
 * 要兼容tiny/mix/private 3种模式
 */
var md5 = require('MD5');
var httpClient = require('co-request')
var file = require('co-fs-plus')
var querystring = require('querystring')

module.exports = function*(request,pagePath) { 
    var miniHost = request.miniHost//来自context-middleware 
    var redisClient = request.redisClient//来自context-middleware 
    var context = request.appContext//来自context-middleware
    var version = context.version
    var serverPattern = context.server_pattern
    var appConfig = context[serverPattern]
    var staticHost = appConfig.static_host     
    //static需要迷你云服务器版本号以及迷你云服务器入口地址
    var params = querystring.stringify({
      version:version,
      mini_host:miniHost
    })
    var url = staticHost + pagePath + "?"+params
    //redisKey不包括miniHost，避免存储同样内容
    var redisKey = md5(staticHost + pagePath + "?version="+version)
    //优先从redis获得页面内容 
    //debug状态下，优先远程请求
    var body = yield redisClient.get(redisKey)
    if (body == null || context.debug) {
      //向static服务器发起内容请求
      var result = yield httpClient(url);
      body = result.body
      yield redisClient.set(redisKey, body)
    }
    return yield merge(body)

  }
  /**
   * 把迷你云服务器信息写入到页面模板中
   * TODO 这部分内容转移到static.minicloud.io
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