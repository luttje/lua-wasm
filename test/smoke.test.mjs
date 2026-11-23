// Loads the module that `node build.mjs` produced and runs Lua with it.
// Build first: these tests fail when dist/ holds no build.

import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { before, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

/** Finds the most recently built liblua-<version>.js in dist/. */
function findBuild() {
  let files = []

  try {
    files = readdirSync(DIST).filter((file) => /^liblua-[\d.]+\.js$/.test(file))
  } catch {
    // No dist/ at all is reported below, like an empty one.
  }

  assert.ok(files.length > 0, 'No build found in dist/. Run `node build.mjs` first.')

  const newest = (file) => statSync(path.join(DIST, file)).mtimeMs
  const file = files.sort((a, b) => newest(b) - newest(a))[0]

  return { file: path.join(DIST, file), version: file.match(/^liblua-([\d.]+)\.js$/)[1] }
}

/**
 * Starts the Emscripten module the way a web page would: the script reads
 * its settings from a `Module` variable that already exists when it runs.
 */
function loadModule(file, settings) {
  const run = new Function('Module', 'require', '__dirname', '__filename', readFileSync(file, 'utf8'))

  return new Promise((resolve, reject) => {
    const Module = { ...settings, onRuntimeInitialized: () => resolve(Module), onAbort: reject }
    run(Module, createRequire(file), path.dirname(file), file)
  })
}

let lua // Every exported Lua C API function, by its C name
let Module
let version
let bindings
const printed = []

before(async () => {
  const build = findBuild()
  version = build.version

  Module = await loadModule(build.file, { print: (text) => printed.push(text), printErr: () => {} })
  bindings = JSON.parse(readFileSync(path.join(DIST, 'luafunctions.json'), 'utf8'))

  lua = {}
  for (const [name, { returnType, parameterTypes }] of Object.entries(bindings)) {
    lua[name] = Module.cwrap(name, returnType, parameterTypes)
  }
})

function newState() {
  const L = lua.luaL_newstate()
  lua.luaL_openlibs(L)

  return L
}

test('every function in luafunctions.json is exported', () => {
  const missing = Object.keys(bindings).filter((name) => typeof Module[`_${name}`] !== 'function')

  assert.deepEqual(missing, [])
})

test('runs Lua code and reads its results', () => {
  const L = newState()

  assert.equal(lua.luaL_loadstring(L, 'return 1 + 1, _VERSION'), 0)
  assert.equal(lua.lua_pcall(L, 0, -1, 0), 0)
  assert.equal(lua.lua_gettop(L), 2)
  assert.equal(lua.lua_tonumber(L, 1), 2)

  const [major, minor] = version.split('.')
  assert.equal(lua.lua_tostring(L, 2), `Lua ${major}.${minor}`)

  lua.lua_close(L)
})

// lua_pcall is a macro since Lua 5.2 and the others below are macros in
// every version, so these calls only work through the generated wrappers.
test('functions that are macros in C are callable', () => {
  const L = newState()

  lua.lua_newtable(L)
  assert.equal(lua.lua_istable(L, -1), 1)
  assert.equal(lua.lua_isnil(L, -1), 0)

  lua.lua_pushstring(L, 'text')
  assert.equal(lua.lua_tostring(L, -1), 'text')

  lua.lua_pop(L, 2)
  assert.equal(lua.lua_gettop(L), 0)

  lua.lua_close(L)
})

test('Lua errors are caught by lua_pcall', () => {
  const L = newState()

  assert.equal(lua.luaL_loadstring(L, 'error("boom")'), 0)
  assert.notEqual(lua.lua_pcall(L, 0, 0, 0), 0)
  assert.match(lua.lua_tostring(L, -1), /boom/)

  lua.lua_close(L)
})

test('print() reaches Module.print', () => {
  const L = newState()

  assert.equal(lua.luaL_dostring(L, 'print("hello from Lua")'), 0)
  assert.ok(printed.includes('hello from Lua'))

  lua.lua_close(L)
})
