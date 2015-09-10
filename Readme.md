
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

[minicloud api](https://minicloud.readme.io) has provided 60 API.

Covering groups, users, devices, files, tags, events related to API

Support file hash upload and block upload

Support [socket.io](https://socket.io)

## Todo list
 
- web client
- pc client(windows/mac/linux)

# License

  MIT
 
[travis-image]: https://img.shields.io/travis/minicloud/minicloud/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloud 
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloud/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloud?branch=master