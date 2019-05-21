'use strict'

/**
 * Module dependencies.
 */

const compressible = require('compressible')
const isJSON = require('koa-is-json')
const status = require('statuses')
const Stream = require('stream')
const bytes = require('bytes')
const zlib = require('zlib')
const brotli = require('iltorb')

/**
 * Encoding methods supported.
 */

const encodingMethods = {
  br: brotli.compressStream,
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate
}

/**
 * Compress middleware.
 *
 * @param {Object} [options]
 * @param {Object} [brOptions]
 * @return {Function}
 * @api public
 */

module.exports = (options = {}, brOptions = {}) => {
  let { filter = compressible, threshold = 1024 } = options
  if (typeof threshold === 'string') threshold = bytes(threshold)

  return async (ctx, next) => {
    ctx.vary('Accept-Encoding')

    await next()

    let { body } = ctx
    if (!body) return
    if (ctx.res.headersSent || !ctx.writable) return
    if (ctx.compress === false) return
    if (ctx.request.method === 'HEAD') return
    if (status.empty[ctx.response.status]) return
    if (ctx.response.get('Content-Encoding')) return

    // forced compression or implied
    if (!(ctx.compress === true || filter(ctx.response.type))) return

    // identity
    const encoding = ctx.acceptsEncodings('br', 'gzip', 'deflate', 'identity')
    if (!encoding) ctx.throw(406, 'supported encodings: gzip, deflate, identity')
    if (encoding === 'identity') return

    // json
    if (isJSON(body)) body = ctx.body = JSON.stringify(body)

    // threshold
    if (threshold && ctx.response.length < threshold) return

    ctx.set('Content-Encoding', encoding)
    ctx.res.removeHeader('Content-Length')

    const compress = encodingMethods[encoding](encoding === 'br' ? brOptions : options)
    const stream = ctx.body = compress

    if (body instanceof Stream) {
      body.pipe(stream)
    } else {
      stream.end(body)
    }
  }
}
