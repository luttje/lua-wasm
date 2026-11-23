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
| `liblua-{LUA_VERSION}.json` | Describes every exported Lua C API function: its return and parameter types, as JavaScript sees them |
| `index.html`, `main.js`, `picker.js`, `styles.css` and `assets/` | A demo page showing how to use the files above. Its sources are in `demo/` |
| `versions.json` | The Lua versions in `dist/`, newest first. The demo offers each of them |

## Trying the demo

Browsers refuse to load `.wasm` files from `file://` URLs, so the demo needs a web server. After building, run:

```
node serve.mjs
```

Then open http://localhost:8080/. Use `--port <port>` to pick another port, or `--dir <dir>` to serve a build made with `--out`.

The demo starts with the newest Lua version in `dist/` and has a picker for the others. To compare versions, build several into the same directory, for example with `node build.mjs --lua 5.1.5,5.4.8,latest`.

Working on the demo itself? `node build.mjs --demo` only copies `demo/` into `dist/` and points it at the Lua builds that are already there. It takes a moment instead of a full compile, so run it after each change and refresh the page.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `--lua <versions>` | `latest` | Comma-separated versions _(in X.Y.Z format)_ of [the Lua sources](https://www.lua.org/ftp/) to download and compile. `latest` looks the newest release up on Lua.org. Lua 5.1 and newer are supported. |
| `--exports <list>` | all functions | Comma-separated Lua C API functions to export to WASM, without the underscore prefix that emcc uses. |
| `--out <dir>` | `dist` | Where to put the built files. |
| `--cache <dir>` | `.cache` | Where to keep the downloaded Lua sources between builds. |
| `--demo` | | Only copy the demo to the output directory, reusing the Lua builds already there. Fast, and needs no Emscripten. |
| `--print-latest` | | Print the latest Lua version and exit. |
| `--clean` | | Remove the output and cache directories and exit. |

### Examples

#### Lua 5.1
```
node build.mjs --lua 5.1.5
```

#### Lua 5.1, 5.4 and the latest version side by side
```
node build.mjs --lua 5.1.5,5.4.8,latest
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
