var koa      = require('koa')
var $proxy   = require('koa-http-proxy')
var proxy    = $proxy('http://127.0.0.1:8080'); 
var app      = koa(); 
app.use(function *(next){
  this.header["proxy-port"]=80; 
  yield next; 
});
var miniJs = {
  run: function *(){ 
    this.body = 'hello World';
  },
};
var _        = require('koa-route');
app.use(_.get('/miniyunjs', miniJs.run)); 
app.use(proxy).listen(80);