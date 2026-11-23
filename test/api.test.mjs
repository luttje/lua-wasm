// Tests for reading the Lua API and generating wrappers. These need no build.

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parseHeaders, parseManual, parseSignature } from '../lib/lua-api.mjs'
import { describeBindings, generateBindingsScript, generateMacroWrappers } from '../lib/wrappers.mjs'

test('parseSignature reads return type, name and parameters', () => {
  assert.deepEqual(parseSignature('lua_pcall', 'int lua_pcall (lua_State *L, int nargs, int nresults, int msgh);'), {
    name: 'lua_pcall',
    returnType: 'int',
    parameters: [
      { type: 'lua_State *', name: 'L', isArray: false },
      { type: 'int', name: 'nargs', isArray: false },
      { type: 'int', name: 'nresults', isArray: false },
      { type: 'int', name: 'msgh', isArray: false },
    ],
    isVariadic: false,
  })
})

test('parseSignature keeps pointer return types', () => {
  assert.equal(parseSignature('lua_getextraspace', 'void *lua_getextraspace (lua_State *L);').returnType, 'void *')
  assert.equal(parseSignature('lua_tostring', 'const char *lua_tostring (lua_State *L, int index);').returnType, 'const char *')
})

test('parseSignature handles void, variadic, array and untyped parameters', () => {
  assert.deepEqual(parseSignature('luaL_newstate', 'lua_State *luaL_newstate (void);').parameters, [])

  const variadic = parseSignature('lua_pushfstring', 'const char *lua_pushfstring (lua_State *L, const char *fmt, ...);')
  assert.equal(variadic.isVariadic, true)
  assert.equal(variadic.parameters.length, 2)

  const array = parseSignature('luaL_newlib', 'void luaL_newlib (lua_State *L, const luaL_Reg l[]);')
  assert.deepEqual(array.parameters[1], { type: 'const luaL_Reg', name: 'l', isArray: true })

  const generic = parseSignature('luaL_opt', 'T luaL_opt (L, func, arg, dflt);')
  assert.equal(generic.parameters[0].type, null)
})

test('parseSignature ignores typedefs and structs', () => {
  assert.equal(parseSignature('lua_CFunction', 'typedef int (*lua_CFunction) (lua_State *L);'), null)
  assert.equal(parseSignature('lua_State', 'typedef struct lua_State lua_State;'), null)
})

test('parseManual finds signatures in both manual layouts', () => {
  const manual = `
    <hr><h3><a name="lua_gettop"><code>lua_gettop</code></a></h3><p>
    <span class="apii">[-0, +0, &ndash;]</span>
    <pre>int lua_gettop (lua_State *L);</pre>
    <hr><h3><a name="lua_Alloc"><code>lua_Alloc</code></a></h3>
    <pre class="api">typedef void * (*lua_Alloc) (void *ud,
                                 void *ptr);</pre>
    <hr><h3><a name="lua_pop"><code>lua_pop</code></a></h3><p>
    <pre class="api">void lua_pop (lua_State *L,
                  int n);</pre>`

  assert.deepEqual(parseManual(manual).map((signature) => signature.name), ['lua_gettop', 'lua_pop'])
})

test('parseHeaders tells functions and macros apart', () => {
  const { functions, macros } = parseHeaders(`
LUA_API int   (lua_gettop) (lua_State *L);
LUA_API lua_CFunction (lua_atpanic) (lua_State *L, lua_CFunction panicf);
LUA_API int   (lua_pcallk) (lua_State *L, int nargs, int nresults, int errfunc,
                            lua_KContext ctx, lua_KFunction k);
LUALIB_API lua_State *(luaL_newstate) (void);
#define lua_pcall(L,n,r,f)	lua_pcallk(L, (n), (r), (f), 0, NULL)
#define lua_pop(L,n)		lua_settop(L, -(n)-1)
`)

  assert.deepEqual([...functions], ['lua_gettop', 'lua_atpanic', 'lua_pcallk', 'luaL_newstate'])
  assert.deepEqual([...macros], ['lua_pcall', 'lua_pop'])
})

test('generateMacroWrappers defines a function per macro', () => {
  const api = [
    { ...parseSignature('lua_gettop', 'int lua_gettop (lua_State *L);'), kind: 'function' },
    { ...parseSignature('lua_pop', 'void lua_pop (lua_State *L, int n);'), kind: 'macro' },
    { ...parseSignature('lua_tostring', 'const char *lua_tostring (lua_State *L, int index);'), kind: 'macro' },
    { ...parseSignature('luaL_newlib', 'void luaL_newlib (lua_State *L, const luaL_Reg l[]);'), kind: 'macro' },
    { ...parseSignature('luaL_opt', 'T luaL_opt (L, func, arg, dflt);'), kind: 'macro' },
  ]

  const { source, wrapped, skipped } = generateMacroWrappers(api)

  assert.deepEqual(wrapped.map((entry) => entry.name), ['lua_pop', 'lua_tostring'])
  assert.deepEqual(skipped.map((entry) => entry.name), ['luaL_newlib', 'luaL_opt'])

  assert.ok(source.includes('static void wasm__lua_pop(lua_State *L, int n) { lua_pop(L, n); }'))
  assert.ok(source.includes('void lua_pop(lua_State *L, int n) { wasm__lua_pop(L, n); }'))
  assert.ok(source.includes('const char *lua_tostring(lua_State *L, int index) { return wasm__lua_tostring(L, index); }'))
  assert.ok(!source.includes('lua_gettop'))

  // Every macro has to be captured before any of them is removed.
  assert.ok(source.lastIndexOf('static ') < source.indexOf('#undef'))
})

test('describeBindings maps C types to cwrap types', () => {
  const bindings = describeBindings([
    parseSignature('lua_tostring', 'const char *lua_tostring (lua_State *L, int index);'),
    parseSignature('lua_pop', 'void lua_pop (lua_State *L, int n);'),
    parseSignature('luaL_loadstring', 'int luaL_loadstring (lua_State *L, const char *s);'),
    parseSignature('luaL_buffaddr', 'char *luaL_buffaddr (luaL_Buffer *B);'),
  ])

  assert.deepEqual(bindings, {
    lua_tostring: { returnType: 'string', parameterTypes: ['number', 'number'] },
    lua_pop: { returnType: null, parameterTypes: ['number', 'number'] },
    luaL_loadstring: { returnType: 'number', parameterTypes: ['number', 'string'] },
    luaL_buffaddr: { returnType: 'number', parameterTypes: ['number'] },
  })
})

test('generateBindingsScript wraps each function on first call', () => {
  const calls = []
  const cwrap = (name, returnType, parameterTypes) => {
    calls.push([name, returnType, parameterTypes])
    return (...args) => `${name}(${args.join(', ')})`
  }

  const Module = {}
  const script = generateBindingsScript({ lua_gettop: { returnType: 'number', parameterTypes: ['number'] } })
  new Function('Module', 'cwrap', script)(Module, cwrap)

  assert.deepEqual(calls, [], 'cwrap must wait until the module is ready')
  assert.equal(Module.lua_gettop(1), 'lua_gettop(1)')
  assert.equal(Module.lua_gettop(2), 'lua_gettop(2)')
  assert.deepEqual(calls, [['lua_gettop', 'number', ['number']]])
})
