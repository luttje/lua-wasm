# Lua Web Assembly
![The official WASM logo](docs/assets/WebAssembly-Logo_128.png)
![The official Lua logo](docs/assets/Lua-Logo_128.png)

Run Lua in a browser client using WebAssembly. Compile easily on Windows or UNIX-based systems.

_Inspired by, and based in part on, [this repository by François Perrad](https://framagit.org/fperrad/lua.wasm)._


## Requirements
* [Emscripten](https://emscripten.org/docs/getting_started/downloads.html)
* A system running `make`, on Windows you should install [the Windows port of the open source GCC compiler by TDM](https://jmeubank.github.io/tdm-gcc/) and add it to the PATH


## Building Lua into a WASM

### On Windows
1. Ensure you installed [the Windows port of the open source GCC compiler by TDM](https://jmeubank.github.io/tdm-gcc/) and added it to your PATH variable
2. Open a command prompt and run 
```mingw32-make all-mingw32```

### On UNIX-based systems
On systems that have `make` installed (by default) you can run the following command from a terminal: 
```make all```

### Cleaning up
After building run `clean` to remove the downloaded Lua sources.

## Current Lua version: `5.4.3`

To change the Lua version to use simply adjust the `Makefile` to set `LUA_VERSION:=5.4.3` to the Lua version you wish to use, then rebuild.
