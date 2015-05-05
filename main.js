var http = require('http');
var https = require('https');
var fs = require("fs");
var forceSSL = require('koa-force-ssl');
var koa = require('koa');
var app = koa();

app.use(forceSSL());
// logger

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// response

app.use(function *(){
	console.log("333333");
  this.body = 'Hello World';
});
 
http.createServer(app.callback()).listen(6091);
var options = {
  key: fs.readFileSync('ssl.key'),
  cert: fs.readFileSync('ssl.crt')
}
https.createServer(options, app.callback()).listen(443);
