# Lua Web Assembly tools

![The official WASM logo](demo/assets/WebAssembly-Logo_128.png)
![The official Lua logo](demo/assets/Lua-Logo_128.png)

_A build script that turns any version of the Lua source-code (5.1 and newer) into Web Assembly. Works on Windows, macOS and Linux._

**[🎈 Play around with a demo here](https://luttje.github.io/lua-wasm)**

## Purpose

As a developer you can use this to build Lua into a WebAssembly file (.wasm).

Using the built Lua WASM you can interact with the original Lua C API in a browser client from JavaScript. This means you can run Lua directly in the user's browser. 

## Building

Read the [BUILDING](BUILDING.md) file to build your own version.

## Quick start

[📂 Download pre-built files from the `Releases`](https://github.com/luttje/lua-wasm/releases).

For usage information continue reading below or checkout [lua-wasm@gh-pages](https://github.com/luttje/lua-wasm/tree/gh-pages) on GitHub to see how [this Demo](https://luttje.github.io/lua-wasm) works.

### Running Lua from JavaScript

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
2. Look in `demo/main.js` for an example of `initWrappers` that wraps the whole Lua C API using the generated `luafunctions.js`, or manually define which functions you wish to wrap:
    ```js
    function initWrappers(){
      luaL_newstate = Module.cwrap('luaL_newstate', 'number', []);
      luaL_openlibs = Module.cwrap('luaL_openlibs', 'number', ['number']);
      luaL_loadstring = Module.cwrap('luaL_loadstring', 'number', ['number', 'string']);
      lua_pcall = Module.cwrap('lua_pcall', 'number', ['number', 'number', 'number', 'number']);
      lua_gettop = Module.cwrap('lua_gettop', 'number', ['number']);
      lua_pop = Module.cwrap('lua_pop', null, ['number', 'number']);
      lua_tostring = Module.cwrap('lua_tostring', 'string', ['number', 'number']);
    }
    ```
    _Functions that are macros in C, like `lua_pcall`, `lua_pop` and `lua_tostring`, are available too. [BUILDING](BUILDING.md#which-functions-are-exported) explains how._
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
      // Call the chunk function (https://www.lua.org/manual/5.4/manual.html#lua_pcall)
      if (lua_pcall(luaState, 0, -1, 0) !== 0)
        console.error('This program failed to run.');
    } else {
      console.error('This program failed to compile.');
    }

    // Get amount of items on the stack
    let stackSize = lua_gettop(luaState);

    if(stackSize > 0){
      console.log('The lua code returned the following:');
      for (let i = 1; i <= stackSize; i++) {
        // Note: booleans become <empty string> with lua_tostring
        console.log(lua_tostring(luaState, i));
      }

      // Empty the stack
      lua_pop(luaState, stackSize);
    }
    ```
6. Include the `liblua-{VERSION}.js` after the code written in the previous steps (preferably just before the `</body>` tag):
    ```html
    <script src="liblua-5.4.8.js"></script>
    ```
7. Execute your code in the browser and check the console for output:
    ```
    Hello World!
    The lua code returned the following:
    zero
    <empty string>
    2
    ```

### 64-bit integers

Since Lua 5.3 a `lua_Integer` is a 64-bit integer, which WebAssembly passes to and from JavaScript as a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). Functions such as `lua_pushinteger` and `lua_tointeger` therefore take and return BigInts:

```js
lua_pushinteger(luaState, 42n);
let value = Number(lua_tointeger(luaState, -1));
```

Passing a regular number where a `lua_Integer` is expected throws a `TypeError`. `lua_pushnumber` and `lua_tonumber` work with regular numbers.
____

## Maintenance & Contributing

If you find a bug, wish to write a feature or make any other type of contribution then I'll gladly take a look at any issues or Pull Requests made.

Ideally this project would require as little maintenance as possible. It's intended to be a tool to quickly build Lua into a Web Assembly file and should not stray from that.

_A GitHub action checks for new Lua versions every week and automatically builds [pre-releases](https://github.com/luttje/lua-wasm/releases). These pass a few automated smoke tests, but are otherwise untested._


## Credits

I was inspired to make this when I came across [this repository by François Perrad](https://framagit.org/fperrad/lua.wasm). The `Makefile` that was based on it has since been replaced by a Node.js script.

[Lua](https://www.lua.org/) is a free and open-source project by Roberto Ierusalimschy and the rest of the [Lua team](https://www.lua.org/authors.html).

## License

This project is open-source under the [📜 MIT License](LICENSE)

For third-party license acknowledgements please refer to the [NOTICE](NOTICE) file