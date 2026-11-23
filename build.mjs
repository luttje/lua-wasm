#!/usr/bin/env node
// Builds a Lua release into WebAssembly. Run `node build.mjs --help` for usage.

import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { fetchLatestVersion, fetchSource, resolveVersion } from './lib/lua-source.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

const HELP = `Usage: node build.mjs [options]

Options:
  --lua <version>   Lua version to build, as X.Y.Z or "latest" (default: latest)
  --out <dir>       Where to put the built files (default: dist)
  --cache <dir>     Where to keep downloaded Lua sources (default: .cache)
  --print-latest    Print the latest Lua version and exit
  --clean           Remove the output and cache directories and exit
  --help            Show this message
`

async function main() {
  const { values: options } = parseArgs({
    options: {
      lua: { type: 'string', default: 'latest' },
      out: { type: 'string', default: 'dist' },
      cache: { type: 'string', default: '.cache' },
      'print-latest': { type: 'boolean' },
      clean: { type: 'boolean' },
      help: { type: 'boolean' },
    },
  })

  const outDir = path.resolve(ROOT, options.out)
  const cacheDir = path.resolve(ROOT, options.cache)

  if (options.help) {
    console.log(HELP)
    return
  }

  if (options['print-latest']) {
    console.log(await fetchLatestVersion())
    return
  }

  if (options.clean) {
    await rm(outDir, { recursive: true, force: true })
    await rm(cacheDir, { recursive: true, force: true })
    return
  }

  const version = await resolveVersion(options.lua)
  console.log(`Building Lua ${version}`)

  const sourceDir = await fetchSource(version, cacheDir)
  console.log(`Lua sources are in ${path.relative(ROOT, sourceDir)}`)
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`)
  process.exitCode = 1
})
