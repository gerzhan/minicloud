
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![devDependency Status](https://david-dm.org/atom/electron/dev-status.svg)](https://david-dm.org/minicloud/minicloud#info=devDependencies)
  
  minicloud v0.5.6

  minicloud based on node.js, providing efficient file storage server for enterprises.

  you can easily integrate existing app nodejs with minicloud.

## About client(include web/desktop/mobile client)

  minicloud is hybrid cloud model.files are stored on own servers, while [minicloud.io](http://minicloud.io) management desktop client&mobile client&web client.

## Create file index.js
```
require('co').wrap(function*(){
	var app = yield require('minicloud')()
	app.listen(8030)
})()

```
## Installation
```
$ npm install minicloud co
```

## Initialize sqlite database file,Just one time
```
$ node ./node_modules/minicloud/install.js 
```
## Run Server
```
$ node index.js 
```
## Test case
```
//register member
curl -X POST http://127.0.0.1:8030/api/v1/members/register \
    --header "Content-Type: application/json" \
    --data "{\"name\":\"zhangsan\",\"nick\":\"xiaozhang\",\"password\":\"8k9v6n\",\"email\":\"zhangsan@minicloud.io\"}"

//login 
curl -X POST http://127.0.0.1:8030/api/v1/oauth2/token \
    --header "Content-Type: application/json" \
    --data "{\"name\":\"zhangsan\",\"password\":\"8k9v6n\",\"device_name\":\"test-pc\"}"

//If successful, there will be the following information output
{"token_type":"bearer","access_token":"xxxxx","expires_in":3600}

```

minicloud is supported in all versions of [iojs](https://iojs.org) without any flags.
To use minicloud with node, you must be running __node 0.12.0__ or higher for generator and promise support, and must run node(1)
  with the `--harmony-generators` or `--harmony` flag.

## HTTP API And Websocket API

[minicloud api documents](https://minicloud.readme.io/docs) has provided 60 API.it's compatible websocket.

- cover departments, groups, users, devices, files, tags, events

- support file hash upload & large file block upload & simple file upload

- support return thumbnail for an image.include ai,bmp,eps,gif,jpg,jpeg,png,psd,tif,tiff

- [350+ test case](https://travis-ci.org/minicloud/minicloud)

- support docx/doc/pptx/ppt/xlsx/xls/pdf online browse view(todo list)

- support txt/docx/doc/pptx/ppt/xlsx/xls/pdf full text search(todo list)

- support [socket.io](https://socket.io),http api can seamless convert to websocket.[demo>>](https://minicloud.readme.io/docs/how-to-use-websocket)

## SDK
[minicloud-js-sdk](https://github.com/minicloud/minicloud-js-sdk) websocket api sdk.compatible [browserify](https://www.npmjs.com/package/browserify),support:ie9+,chrome,firefox,safari.

## Supported database type

 minicloud base on [sequelize](https://github.com/sequelize/sequelize).It currently supports MySQL, MariaDB, SQLite, PostgreSQL and MSSQL. 
 
 node 0.12.0+ SQLite3,MySQL,MSSQL,PostgreSQL

 iojs 1.x SQLite3,MySQL,MSSQL,PostgreSQL

 iojs 2.x SQLite3,MySQL,MSSQL,PostgreSQL

 iojs 3.x SQLite3,MySQL,MSSQL

 node 4.x SQLite3,MySQL,MSSQL

## Examples
[nodejs web app integrate with minicloud+sqlite](https://github.com/minicloud/nodejs-example)

[nodejs web app integrate with minicloud+mysql](https://github.com/minicloud/nodejs-mysql-example)

[express app integrate with minicloud+sqlite](https://github.com/minicloud/express-example)

[express app integrate with minicloud+mysql](https://github.com/minicloud/express-mysql-example)

[koa app integrate with minicloud+sqlite](https://github.com/minicloud/koa-example)

[koa app integrate with minicloud+mysql](https://github.com/minicloud/koa-mysql-example)

## Todo list
 
- web client
- pc client(windows/mac/linux)

# License

  MIT
 
[travis-image]: https://img.shields.io/travis/minicloud/minicloud/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloud 
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloud/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloud?branch=master