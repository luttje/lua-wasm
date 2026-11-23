#!/usr/bin/env node
// Builds Lua releases into WebAssembly. Run `node build.mjs --help` for usage.

import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { compile } from './lib/emcc.mjs'
import { readApi } from './lib/lua-api.mjs'
import { compareVersions, fetchLatestVersion, fetchSource, resolveVersion } from './lib/lua-source.mjs'
import { describeBindings, generateBindingsScript, generateMacroWrappers } from './lib/wrappers.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DEMO_DIR = path.join(ROOT, 'demo')

const HELP = `Usage: node build.mjs [options]

Options:
  --lua <versions>  Comma-separated Lua versions to build, as X.Y.Z or "latest",
                    for example 5.1.5,5.4.8,latest (default: latest)
  --exports <list>  Comma-separated Lua C API functions to export, for example
                    luaL_newstate,luaL_loadstring,lua_pcall (default: all)
  --out <dir>       Where to put the built files (default: dist)
  --cache <dir>     Where to keep downloaded Lua sources (default: .cache)
  --demo            Only copy the demo to the output directory, reusing the
                    Lua builds already there (fast, no emcc needed)
  --print-latest    Print the latest Lua version and exit
  --clean           Remove the output and cache directories and exit
  --help            Show this message
`

/** Narrows the exportable API down to the names given with --exports. */
function selectExports(exportable, requested) {
  if (!requested) return exportable

  const byName = new Map(exportable.map((entry) => [entry.name, entry]))
  const names = requested.split(',').map((name) => name.trim()).filter(Boolean)
  const missing = names.filter((name) => !byName.has(name))

  if (missing.length > 0) {
    throw new Error(`Cannot export ${missing.join(', ')}: not an exportable function of this Lua version`)
  }

  return names.map((name) => byName.get(name))
}

/**
 * Copies the demo page to `outDir`, with a versions.json that lists every
 * Lua build in there, newest first. The demo offers each of them.
 */
async function copyDemo(outDir) {
  const versions = (await readdir(outDir).catch(() => []))
    .map((file) => file.match(/^liblua-(\d+\.\d+\.\d+)\.mjs$/)?.[1])
    .filter(Boolean)
    .sort(compareVersions)
    .reverse()

  if (versions.length === 0) {
    throw new Error(`No Lua build found in ${outDir}. Run \`node build.mjs\` once first.`)
  }

  await cp(DEMO_DIR, outDir, { recursive: true })
  await writeFile(path.join(outDir, 'versions.json'), `${JSON.stringify(versions)}\n`)

  return versions
}

/** Compiles one Lua version into `outDir` as liblua-<version>.mjs, .wasm and .json. */
async function build(version, { outDir, cacheDir, exports }) {
  console.log(`Building Lua ${version}`)

  const sourceDir = await fetchSource(version, cacheDir)
  const { api, unknown } = await readApi(sourceDir)
  const functions = api.filter((entry) => entry.kind === 'function')
  console.log(`Found ${functions.length} functions and ${api.length - functions.length} macros in the Lua ${version} manual`)

  if (unknown.length > 0) {
    console.warn(`Skipping names the manual documents but the public headers don't define: ${unknown.join(', ')}`)
  }

  const wrappers = generateMacroWrappers(api)
  const wrappersPath = path.join(sourceDir, 'lua_wasm_macros.c')
  await writeFile(wrappersPath, wrappers.source)
  console.log(`Wrapped ${wrappers.wrapped.length} macros as functions in ${path.relative(ROOT, wrappersPath)}`)

  for (const { name, reason } of wrappers.skipped) {
    console.warn(`Skipping macro ${name}: ${reason}`)
  }

  const exported = selectExports([...functions, ...wrappers.wrapped], exports)
  const name = `liblua-${version}`

  // The module puts every exported function on itself, already wrapped.
  const bindings = describeBindings(exported)
  const bindingsPath = path.join(sourceDir, 'lua_wasm_bindings.js')
  await writeFile(bindingsPath, generateBindingsScript(bindings))

  await mkdir(outDir, { recursive: true })
  console.log(`Compiling with emcc, exporting ${exported.length} functions`)

  await compile({
    sourceDir,
    version,
    extraSources: [wrappersPath],
    exportedNames: exported.map((entry) => entry.name),
    postJs: bindingsPath,
    outDir,
    name,
  })

  // The same description as JSON, for tools and type generators.
  await writeFile(path.join(outDir, `${name}.json`), `${JSON.stringify(bindings, null, 2)}\n`)

  console.log(`Built ${name}.mjs and ${name}.wasm in ${path.relative(process.cwd(), outDir) || '.'}`)
}

async function main() {
  const { values: options } = parseArgs({
    options: {
      lua: { type: 'string', default: 'latest' },
      exports: { type: 'string' },
      out: { type: 'string' },
      cache: { type: 'string' },
      demo: { type: 'boolean' },
      'print-latest': { type: 'boolean' },
      clean: { type: 'boolean' },
      help: { type: 'boolean' },
    },
  })

  const outDir = path.resolve(options.out ?? path.join(ROOT, 'dist'))
  const cacheDir = path.resolve(options.cache ?? path.join(ROOT, '.cache'))
  const where = path.relative(process.cwd(), outDir) || '.'

  if (options.help) {
    console.log(HELP)
    return
  }

  if (options['print-latest']) {
    console.log(await fetchLatestVersion())
    return
  }

  if (options.demo) {
    const versions = await copyDemo(outDir)
    console.log(`Copied the demo to ${where}, offering Lua ${versions.join(', ')}`)
    return
  }

  if (options.clean) {
    await rm(outDir, { recursive: true, force: true })
    await rm(cacheDir, { recursive: true, force: true })
    return
  }

  const requested = options.lua.split(',').map((version) => version.trim()).filter(Boolean)
  const versions = [...new Set(await Promise.all(requested.map(resolveVersion)))]

  for (const version of versions) {
    await build(version, { outDir, cacheDir, exports: options.exports })
  }

  const offered = await copyDemo(outDir)
  console.log(`Copied the demo to ${where}, offering Lua ${offered.join(', ')}`)
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`)
  process.exitCode = 1
})
