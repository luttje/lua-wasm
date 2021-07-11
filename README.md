# Lua Web Assembly

![The official WASM logo](docs/assets/WebAssembly-Logo_128.png)
![The official Lua logo](docs/assets/Lua-Logo_128.png)

Interact with the Lua C API in a browser client using WebAssembly. With this you can run Lua from JavaScript. [🎈 Play around with a demo here](https://luttje.github.io/lua-wasm/liblua.html) 

This project is easily compiled on Windows or UNIX-based systems.

_Inspired by, and based in part on, [this repository by François Perrad](https://framagit.org/fperrad/lua.wasm)._

## Requirements

* [Emscripten](https://emscripten.org/docs/getting_started/downloads.html)
* A system running `make`
    * **Or on Windows** you should install [the Windows port of the open source GCC compiler by TDM](https://jmeubank.github.io/tdm-gcc/). Add it to your PATH variable.

## Building Lua into a WASM

_Check the [Releases](https://github.com/luttje/lua-wasm/releases) for pre-built files._

Use the build command below that is relevant for your system. Building will create a `liblua.js` and `liblua.wasm` file in the `docs/` directory.

### On Windows

1. Ensure you installed [the Windows port of the open source GCC compiler by TDM](https://jmeubank.github.io/tdm-gcc/) and added it to your PATH variable
2. Open a command prompt and run 
```mingw32-make all-mingw32```

### On UNIX-based systems

On systems that have `make` installed (by default) you can run the following command from a terminal: 
```make all```

### Changing the Lua version

#### Current Lua version: `5.4.3`

To change the Lua version to use simply adjust the `Makefile` to set `LUA_VERSION:=5.4.3` to the Lua version you wish to use, then rebuild.

### Cleaning up

After building run `clean` to remove the downloaded Lua sources.

## Running Lua from JavaScript

### Learn by example

After following the above build information or [downloading a release](https://github.com/luttje/lua-wasm/releases) have a look at the example in `liblua.html` for an example on how to implement the Lua C API in JavaScript.

Alternatively you could check out [lua-wasm@gh-pages](https://github.com/luttje/lua-wasm/tree/gh-pages) on GitHub to see how [this Demo](https://luttje.github.io/lua-wasm/liblua.html) works.

### Step-by-step

1. Define a global Module variable that looks at least like this:
    ```js
    var Module = {
      preRun: [initWrappers],
      print: function(text) {
        console.log(text);
      },
      printErr: function(text) {
        console.error(text);
      }
    };
    ```
    _Read more about the Module object in [the Emscripten documentation](https://emscripten.org/docs/api_reference/module.html#affecting-execution)_
2. Look in `docs/main.js` for an example of `initWrappers`, or manually define which of the Lua C API you wish to wrap:
    ```js
    function initWrappers(){
      luaL_newstate = Module.cwrap('luaL_newstate', 'number', []);
      luaL_openlibs = Module.cwrap('luaL_openlibs', 'number', ['number']);
      luaL_loadstring = Module.cwrap('luaL_loadstring', 'number', ['number', 'string']);
      lua_pcallk = Module.cwrap('lua_pcallk', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
      lua_gettop = Module.cwrap('lua_gettop', 'number', ['number']);
      lua_settop = Module.cwrap('lua_settop', 'number', ['number', 'number']);
      lua_tolstring = Module.cwrap('lua_tolstring', 'string', ['number', 'number', 'number']);
    }
    ```
3. You can now use these Lua C API functions
4. First initialize a Lua state:
    ```js
    let luaState = luaL_newstate();
    luaL_openlibs(luaState);
    ```
5. Next use the state to implement some code. Here's an example to run a string containing Lua:
    ```js
    let luaCode = "print('Hello World!'); return 'zero', true, 2;";

    // Load the Lua code as a chunk and leave it on the stack as a callable function
    if (luaL_loadstring(luaState, luaCode) == 0) {
      // Call the chunk function (https://www.lua.org/manual/5.3/manual.html#4.7)
      if (lua_pcallk(luaState, 0, -1, 0, 0) !== 0)
        console.error('This program failed to run.');
    } else {
      console.error('This program failed to compile.');
    }

    // Get amount of items on the stack
    let stackSize = lua_gettop(luaState);

    if(stackSize > 0){
      console.log('The lua code returned the following:');
      for (let i = 1; i <= stackSize; i++) {
        // Note: booleans become <empty string> with lua_tolstring
        console.log(lua_tolstring(luaState, i));
      }

      // Empty the stack
      lua_settop(luaState, -1 - stackSize);
    }
    ```