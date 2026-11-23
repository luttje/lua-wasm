# Building the Lua source-code into a WASM

One Node.js script downloads the Lua sources and compiles them to WebAssembly. It works the same on Windows, macOS and Linux.

## Requirements

* [Node.js](https://nodejs.org/en/download/) 20 or newer - Runs the build script. No `npm install` is needed.
* [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) - Compiles the Lua sources into a `.wasm` and `.js` file. Activate it (`emsdk activate latest` and `emsdk_env`) so that `emcc` is on your PATH.
* `tar` - Unpacks the Lua sources. It comes with Windows 10 and newer, macOS and Linux.

## Build

Run this in the root of this repository to build the latest Lua version:

```
node build.mjs
```

The `dist/` directory then contains:

| File | Purpose |
| --- | --- |
| `liblua-{LUA_VERSION}.mjs` and `liblua-{LUA_VERSION}.wasm` | Lua, built by Emscripten as an ES module. See the [README](README.md#usage) for how to use it |
| `luafunctions.json` | Describes every exported Lua C API function: its return and parameter types, as JavaScript sees them |
| `index.html`, `main.js` and `assets/` | A demo page showing how to use the files above. Its sources are in `demo/` |

Open the demo through a web server, for example with `npx http-server dist`. Browsers refuse to load `.wasm` files from `file://` URLs.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `--lua <version>` | `latest` | The version _(in X.Y.Z format)_ of [the Lua sources](https://www.lua.org/ftp/) to download and compile. `latest` looks the newest release up on Lua.org. Lua 5.1 and newer are supported. |
| `--exports <list>` | all functions | Comma-separated Lua C API functions to export to WASM, without the underscore prefix that emcc uses. |
| `--out <dir>` | `dist` | Where to put the built files. |
| `--cache <dir>` | `.cache` | Where to keep the downloaded Lua sources between builds. |
| `--print-latest` | | Print the latest Lua version and exit. |
| `--clean` | | Remove the output and cache directories and exit. |

### Examples

#### Lua 5.1
```
node build.mjs --lua 5.1.5
```

#### Latest Lua version with 3 functions exposed to WASM
```
node build.mjs --exports luaL_newstate,luaL_loadstring,lua_pcall
```

## Which functions are exported

The build reads the reference manual that ships inside every Lua release (`doc/manual.html`) and exports each C API function it documents, so the list always matches the version you build.

Part of the Lua C API consists of macros, such as `lua_pcall`, `lua_tostring` and `lua_pop`. A macro disappears when C is compiled, which leaves nothing to export. The build therefore generates a small C file that defines a real function for each macro, under the same name. You find it next to the downloaded sources, as `.cache/lua-{LUA_VERSION}/lua_wasm_macros.c`.

A few macros cannot become functions and are skipped. The build prints which ones:

* `lua_pushliteral`, `luaL_newlib` and `luaL_newlibtable` only work on literals. Use `lua_pushstring`, or `lua_createtable` with `luaL_setfuncs`, instead.
* `luaL_opt` has no fixed parameter types.

## Tests

After building, run:

```
node --test
```

This loads the build from `dist/` in Node.js and runs Lua code with it.

## Cleaning up

Run `node build.mjs --clean` to remove the downloaded Lua sources and the built files.
