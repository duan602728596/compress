# Koa Compress

[![Build Status](https://travis-ci.org/koajs/compress.svg?branch=master)](https://travis-ci.org/koajs/compress)
[![codecov](https://codecov.io/gh/koajs/compress/branch/master/graph/badge.svg)](https://codecov.io/gh/koajs/compress)
[![Greenkeeper badge](https://badges.greenkeeper.io/koajs/compress.svg)](https://greenkeeper.io/)

Compress middleware for Koa

> forked from [koa-compress](https://github.com/koajs/compress), support brotli compression.

## Example

```js
var compress = require('koa-compress')
var Koa = require('koa')

var app = new Koa()
app.use(compress(
  /* compress Options(gzip) */
  {
    filter: function (content_type) {
  	  return /text/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  },
  /* brOptions */
  { iltorb: true }
))
```

## brOptions

iltorb: Replace `zlib` with `iltorb` module for br compression (The iltorb module is faster than zlib compression).
You must download the `iltorb` module yourself.   

If you use the `zlib` module: https://nodejs.org/api/zlib.html#zlib_class_brotlioptions   

If you use the `iltorb` module: https://github.com/nstepien/iltorb

## Options

The options are passed to `zlib`: https://nodejs.org/api/zlib.html#zlib_class_optionsz

### filter

An optional function that checks the response content type to decide whether to compress.
By default, it uses [compressible](https://github.com/expressjs/compressible).

### threshold

Minimum response size in bytes to compress.
Default `1024` bytes or `1kb`.

## Manually turning compression on and off

You can always enable compression by setting `this.compress = true`.
You can always disable compression by setting `this.compress = false`.
This bypasses the filter check.

```js
app.use((ctx, next) => {
  ctx.compress = true
  ctx.body = fs.createReadStream(file)
})
```
