/**
 * 把全局变量放到request中，这样便于统一管理
 * 全局变量不能在运行过程中进行修改
 */
module.exports = function(opts) {
	return function* miniHost(next) {
		var appContext = global.appContext
		var serverPattern = appContext.server_pattern
	    var appConfig = appContext[serverPattern]
	    var miniHost = this.request.header.host
	    if (serverPattern == "mix_cloud") {
	    	//mix模式下直接获取header.host
	      miniHost = this.request.header.host
	    } else if (serverPattern == "tiny_cloud") {
	    	//tiny模式下获得header下的mini_host由proxy传递过来
	      miniHost = this.request.header.mini_host
	    } else if (serverPattern == "private_cloud") {
	    	//private模式下获得header.host
	      miniHost = this.request.header.host
	    }
	    //把miniHost放到request中
	    this.request.miniHost = miniHost
	    //把appContext放到request中
	    this.request.appContext = global.appContext	   
	    //把redisClient放到request中
	    this.request.redisClient = global.redisClient
	    
		yield * next
	}
}