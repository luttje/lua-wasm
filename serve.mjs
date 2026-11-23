#!/usr/bin/env node
// Serves the build so the demo can be tried in a browser, which refuses to
// load .wasm files from file:// URLs. Run `node serve.mjs --help` for usage.

import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

const HELP = `Usage: node serve.mjs [options]

Options:
  --dir <dir>    Directory to serve (default: dist)
  --port <port>  Port to listen on (default: 8080)
  --help         Show this message
`

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
}

/** Maps a request path onto a file inside `dir`, or null if it points outside. */
function resolveFile(dir, urlPath) {
  const file = path.join(dir, decodeURIComponent(urlPath))

  return file === dir || file.startsWith(dir + path.sep) ? file : null
}

async function handle(dir, request, response) {
  let file = resolveFile(dir, new URL(request.url, 'http://localhost').pathname)

  if (file && (await stat(file).catch(() => null))?.isDirectory()) file = path.join(file, 'index.html')

  const body = file && (await readFile(file).catch(() => null))

  if (!body) {
    response.writeHead(404, { 'content-type': 'text/plain' }).end('Not found')
    return
  }

  const type = CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream'
  response.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }).end(body)
}

const { values: options } = parseArgs({
  options: {
    dir: { type: 'string' },
    port: { type: 'string', default: '8080' },
    help: { type: 'boolean' },
  },
})

if (options.help) {
  console.log(HELP)
} else {
  const dir = path.resolve(options.dir ?? path.join(ROOT, 'dist'))

  if (!existsSync(path.join(dir, 'index.html'))) {
    console.error(`No demo found in ${dir}. Run \`node build.mjs\` first.`)
    process.exitCode = 1
  } else {
    createServer((request, response) => {
      handle(dir, request, response).catch((error) => {
        console.error(error)
        if (!response.headersSent) response.writeHead(500).end()
      })
    })
      .on('error', (error) => {
        console.error(`Could not start the server: ${error.message}`)
        process.exitCode = 1
      })
      .listen(Number(options.port), () => {
        console.log(`Serving ${path.relative(process.cwd(), dir) || '.'} at http://localhost:${options.port}/ (Ctrl+C to stop)`)
      })
  }
}
