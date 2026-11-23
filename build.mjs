#!/usr/bin/env node
// Builds a Lua release into WebAssembly. Run `node build.mjs --help` for usage.

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { compile } from './lib/emcc.mjs'
import { readApi } from './lib/lua-api.mjs'
import { fetchLatestVersion, fetchSource, resolveVersion } from './lib/lua-source.mjs'
import { describeBindings, generateBindingsScript, generateMacroWrappers } from './lib/wrappers.mjs'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DEMO_DIR = path.join(ROOT, 'demo')

const HELP = `Usage: node build.mjs [options]

Options:
  --lua <version>   Lua version to build, as X.Y.Z or "latest" (default: latest)
  --exports <list>  Comma-separated Lua C API functions to export, for example
                    luaL_newstate,luaL_loadstring,lua_pcall (default: all)
  --out <dir>       Where to put the built files (default: dist)
  --cache <dir>     Where to keep downloaded Lua sources (default: .cache)
  --demo            Only copy the demo to the output directory, reusing the
                    Lua build already there (fast, no emcc needed)
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

/** Copies the demo page to `outDir`, pointed at the Lua module `<name>.mjs`. */
async function copyDemo(outDir, name) {
  await cp(DEMO_DIR, outDir, { recursive: true })

  const demoScript = path.join(outDir, 'main.js')
  await writeFile(demoScript, (await readFile(demoScript, 'utf8')).replace('./liblua.mjs', `./${name}.mjs`))
}

/** Finds the name of the most recently built Lua module in `outDir`. */
async function findBuiltModule(outDir) {
  const files = (await readdir(outDir).catch(() => [])).filter((file) => /^liblua-[\d.]+\.mjs$/.test(file))

  if (files.length === 0) {
    throw new Error(`No Lua build found in ${outDir}. Run \`node build.mjs\` once first.`)
  }

  const builtAt = async (file) => (await stat(path.join(outDir, file))).mtimeMs
  const times = await Promise.all(files.map(builtAt))

  return files[times.indexOf(Math.max(...times))].replace(/\.mjs$/, '')
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

  if (options.help) {
    console.log(HELP)
    return
  }

  if (options['print-latest']) {
    console.log(await fetchLatestVersion())
    return
  }

  if (options.demo) {
    const name = await findBuiltModule(outDir)
    await copyDemo(outDir, name)
    console.log(`Copied the demo to ${path.relative(process.cwd(), outDir) || '.'}, using ${name}.mjs`)
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

  const exported = selectExports([...functions, ...wrappers.wrapped], options.exports)
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
  await writeFile(path.join(outDir, 'luafunctions.json'), `${JSON.stringify(bindings, null, 2)}\n`)

  await copyDemo(outDir, name)

  console.log(`Built ${name}.mjs and ${name}.wasm in ${path.relative(process.cwd(), outDir) || '.'}`)
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`)
  process.exitCode = 1
})
