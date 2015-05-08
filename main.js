var isDebug  = true;
var appPort  = 80;
var koa      = require('koa')
var route    = require('koa-route');
var $proxy   = require('koa-http-proxy')
//以//xxx/api/的请求转移到iojs执行
var miniJs = {
  run: function *(){ 
    this.body = 'h11ello World';
  },
};
var app = koa(); 
app.use(route.get('/api/~', miniJs.run)); 
if(isDebug){  
	//搭建开发环境
	//迷你云访问地址
	var miniHost = "pan.nje.cn";
	var MiniDev  = require("./mini-dev").MiniDev;
	var miniEnv  = new MiniDev(app,miniHost,appPort);
	miniEnv.vhost();
}else{
	//搭建生成环境
	//迷你云通过IP或端口都可访问
	app.use(function *(next){
		this.header["proxy-port"]=appPort; 
		yield next; 
	});
	app.use($proxy('http://127.0.0.1:7070'));
} 
app.listen(appPort);