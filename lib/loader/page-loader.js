/**
 * 网页版判断用户是否登陆
 * 根据url中的token参数以及cookie中的token进行判断 
 * 如是非法登陆，则跳转到登陆页面，并带过去错误码
 */
var MiniWebUtil = require("../mini-web-util")
var oauth2Model = require('../../api/oauth2/model')

var validAccessToken = function(accessToken) {
	return function(done) {
		if (typeof accessToken == "undefined") {
			return done(null,10000)			
		}
		oauth2Model.getAccessToken(accessToken, function(err, token) {
			if (err) {
				//服务器异常
				return done(err,10002)				
			}
			if (!token) {
				//token无效
				return done(null,10003) 
			}
			if (token.expires !== null &&
				(!token.expires || token.expires < new Date())) {
				//token过期
				return done(null,10004)				
			}
			done(null,1)
		})
	}
}
/**
* 把验证cookie中的access_token 导出为koa中间件 
*/
module.exports = function(opts) {
	opts = opts || {};
	return function* pageLoader(next) {			
		//优先参数中的token，如参数中没有，则优先cookie中的token
		var accessToken = this.request.query.token 
		if(typeof(accessToken)=="undefined"){
			accessToken = this.cookies.get('token')
		}		
		//验证token是否合法
		var errorCode = yield validAccessToken(accessToken)
		if (errorCode == 1) {
			yield * next
		} else {
			//跳转到登陆页，并把登陆成功的页面显示出来
			var returnUrl = MiniWebUtil.getRefererUrl(this.request)
			var url = MiniWebUtil.createUrl(this.request, "/login", {
				return_url: returnUrl,
				error_code: errorCode
			})
			this.redirect(url)
		}
	};

}