
  [![build status][travis-image]][travis-url]
  [![Coverage Status](https://coveralls.io/repos/minicloud/minicloudjs/badge.svg?branch=master&service=github)](https://coveralls.io/github/minicloud/minicloudjs?branch=master)

  minicloud v2.2 entry


## Example

```js
var koa = require('koa');
var app = koa();

// logger

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// response

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```

## Running tests

```
$ make test
```

# License

  MIT
 
[travis-image]: https://img.shields.io/travis/minicloud/minicloudjs/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloudjs 
