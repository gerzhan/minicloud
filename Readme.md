
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![devDependency Status](https://david-dm.org/atom/electron/dev-status.svg)](https://david-dm.org/minicloud/minicloud#info=devDependencies)
  
  minicloud v3.0-beta.1

  minicloud based on node.js, providing efficient file storage server for enterprises.

  minicloud is hybrid cloud model.Files are stored on own servers, while [minicloud.io](http://minicloud.io) management PC client / mobile client / web client

## Installation
```
$ git clone http://github.com/minicloud/minicloud
$ cd minicloud
$ npm install
$ npm test
```

minicloud is supported in all versions of [iojs](https://iojs.org) without any flags.
To use minicloud with node, you must be running __node 0.12.0__ or higher for generator and promise support, and must run node(1)
  with the `--harmony-generators` or `--harmony` flag.

## API

[minicloud api](https://minicloud.readme.io/docs) has provided 60 API.

- cover groups, users, devices, files, tags, events

- support file hash upload and large file block upload/simple file upload

- support return thumbnail for an image.include ai,bmp,eps,gif,jpg,jpeg,png,psd,tif,tiff

- support docx/doc/pptx/ppt/xlsx/xls/pdf/ai/psd/tiff online browse(todo list)

- support txt/docx/doc/pptx/ppt/xlsx/xls/pdf full text search(todo list)

- support [socket.io](https://socket.io),http api can seamless convert to websocket.[demo>>](https://minicloud.readme.io/docs/how-to-use-websocket)

## Todo list
 
- web client
- pc client(windows/mac/linux)

# License

  MIT
 
[travis-image]: https://img.shields.io/travis/minicloud/minicloud/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloud 
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloud/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloud?branch=master