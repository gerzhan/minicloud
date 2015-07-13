<img src="https://dl.dropboxusercontent.com/u/6396913/koa/logo.png" alt="koa middleware framework for nodejs" width="255px" />

  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]

  Expressive middleware for node.js using generators via [co](https://github.com/visionmedia/co)
  to make web applications and APIs more enjoyable to write. Koa's middleware flow in a stack-like manner allowing you to perform actions downstream, then filter and manipulate the response upstream. Koa's use of generators also greatly increases the readability and robustness of your application.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~550 SLOC codebase. This
  includes things like content-negotiation, normalization of node inconsistencies, redirection, and a few others.

  No middleware are bundled with koa.

## Installation