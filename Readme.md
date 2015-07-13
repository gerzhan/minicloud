
  [![gitter][gitter-image]][gitter-url] 
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]

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
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloudjs/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloudjs?branch=master
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/minicloud/minicloudjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
