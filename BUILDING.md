# Building the Lua source-code into a WASM

Run the build command below that is relevant for your system in the root of this repository. 

Building will create a `liblua-{LUA_VERSION}.js` and `liblua-{LUA_VERSION}.wasm` file the `dist/` directory. 

The `docs/` directory will contain an `index.html` showing how to use the built files.

## Requirements

* [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) - To build the Lua sources into a `.wasm` and `.js` file.
* A compiler that can handle the `Makefile` format:
  * `make`
  * (Windows) [The Windows port of the open source GCC compiler by TDM](https://jmeubank.github.io/tdm-gcc/).
* [Node.js](https://nodejs.org/en/download/) - Used by the `Makefile` to execute the scripts in `tools/`
  
Add the paths to all the above software to your PATH variable.

## Build

Before you start ensure that all tools have their node modules installed:
```
(cd tools/fetch-latest-lua-version && npm install)
(cd tools/scrape-lua-signatures && npm install)
```

### Windows

1. Ensure you installed [the Windows port of the open source GCC compiler by TDM](https://jmeubank.github.io/tdm-gcc/) and added it to your PATH variable.
2. Open a command prompt in the root of this repository and run 
`mingw32-make COMPILER=mingw32-make`

### UNIX-based systems

Run this command from a terminal in the root of this repository: 
`make all`

## Makefile usage

The makefile can be configured to your needs by setting variables. This is also useful for the CI script in this repo.

### Configuration variables

* **COMPILER** - _`Default: make`_: The compiler executable to use to build the sources.
* **LUA_VERSION** - _`Default: Latest or 5.4.3`_: The version _(in X.Y.Z format)_ of [the Lua sources](https://www.lua.org/ftp/) to download and compile. If no version is provided the `fetch-latest-lua-version` node script tries to scrape Lua.org. If node is not installed the default version is chosen.
* **EXPORTED_FUNCTIONS** - _`Default: array of some C API functions`_: Which Lua C API functions to export to WASM, formatted as a JSON array. By default the Makefile creates an array of all Lua functions that are not macro's (e.g: `#define lua_call(L,n,r)...`). The array is created by a node script that scrapes the Lua.org manual and checks if no `#define` exists in the downloaded sources.

### Other command examples

#### Lua 5.1 on Windows (mingw32)
```
mingw32-make all COMPILER=mingw32-make LUA_VERSION=5.1.1
```

#### Latest Lua version with 2 functions exposed to WASM
```
make all EXPORTED_FUNCTIONS="['_lua_newstate', '_luaL_loadstring']"
```
Take note that emcc requires C function names to be prefixed with an underscore(_).


## Cleaning up

After building run `clean` to remove the downloaded Lua sources.