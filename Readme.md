
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![devDependency Status](https://david-dm.org/atom/electron/dev-status.svg)](https://david-dm.org/minicloud/minicloud#info=devDependencies)
  
  minicloud

  minicloud based on node.js, providing efficient file storage server for enterprises.

  you can easily integrate existing app nodejs with minicloud.

## About client(include web/desktop/mobile client)

  minicloud is hybrid cloud model.files are stored on own servers, while [minicloud.io](http://minicloud.io) management desktop client&mobile client&web client.

## Example

### Create file index.js
```js
require('co').wrap(function*(){
	var app = yield require('minicloud')()
	app.listen(8030)
})()

```
### Installation package
```
$ npm install minicloud co
中国大陆用户建议下面方式安装依赖(cnpm 详情见:http://npm.taobao.org/)
$ cnpm install minicloud co
```

### Initialize sqlite database file(Just one time)
```
$ node ./node_modules/minicloud/install.js 
```
### Run Server
```
$ node index.js 
```
### Run Test
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


## API documentation

[minicloud api documents](https://minicloud.readme.io/docs) has provided 60 API.it's compatible websocket.

- cover departments, groups, users, user devices, files, file tags,login/logout events,file operate events

- support file hash upload,large file block upload,simple file upload

- support return thumbnail for an image.support ai,bmp,eps,gif,jpg,jpeg,png,psd,tif,tiff

- [330+ test case](https://travis-ci.org/minicloud/minicloud)(大陆用户需翻墙)

- support docx/doc/pptx/ppt/xlsx/xls/pdf online browse view(todo list)

- support txt/docx/doc/pptx/ppt/xlsx/xls/pdf full text search(todo list)

- support [socket.io](https://socket.io),http api can seamless convert to websocket.[demo>>](https://minicloud.readme.io/docs/how-to-use-websocket)

## SDK

[minicloud-js-sdk](https://github.com/minicloud/minicloud-js-sdk) websocket api sdk.compatible [browserify](https://www.npmjs.com/package/browserify),support:ie10+,chrome,firefox.

## About supported database

 minicloud base on [sequelize](https://github.com/sequelize/sequelize).It currently supports MySQL, MariaDB, SQLite, PostgreSQL and MSSQL. 

## About Node version

minicloud is supported in all versions of [iojs](https://iojs.org) without any flags.
To use minicloud with node, you must be running __node 0.12.0__ or higher for generator and promise support, and must run node(1)
  with the `--harmony-generators` or `--harmony` flag.

node 0.12+ MySQL MariaDB SQLite PostgreSQL MSSQL

iojs 1.x   MySQL MariaDB SQLite PostgreSQL MSSQL

iojs 2.x   MySQL MariaDB SQLite PostgreSQL MSSQL

iojs 3.x   MySQL MariaDB SQLite MSSQL

node 4.x   MySQL MariaDB SQLite MSSQL

## Examples

[koa app integrate with minicloud](https://github.com/minicloud/koa-example)


## Todo list
 
- web client
- pc client(windows/mac/linux)

# License

  MIT
 
[travis-image]: https://img.shields.io/travis/minicloud/minicloud/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloud 
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloud/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloud?branch=master