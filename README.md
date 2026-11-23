# Lua Web Assembly tools

![The official WASM logo](demo/assets/WebAssembly-Logo_128.png)
![The official Lua logo](demo/assets/Lua-Logo_128.png)

_A build script that turns any version of the Lua source-code (5.1 and newer) into WebAssembly, so you can use the Lua C API from JavaScript in the browser or in Node.js._

**[🎈 Play around with a demo here](https://luttje.github.io/lua-wasm)**

## Usage

[📂 Download pre-built files from the `Releases`](https://github.com/luttje/lua-wasm/releases), or [build them yourself](BUILDING.md).

Put `liblua-{VERSION}.mjs` and `liblua-{VERSION}.wasm` next to each other and import the `.mjs`. It gives you a function that loads Lua, with every Lua C API function under its C name:

```js
import createLua from './liblua-5.4.8.mjs'

const lua = await createLua({ print: console.log })

const L = lua.luaL_newstate()
lua.luaL_openlibs(L)

if (lua.luaL_dostring(L, "print('Hello World!') return 'done'") === 0) {
  console.log(lua.lua_tostring(L, -1)) // done
} else {
  console.error(lua.lua_tostring(L, -1)) // The error message
}

lua.lua_close(L)
```

In a web page, load your script with `<script type="module">` and serve it from a web server. Browsers refuse to load `.wasm` files from `file://` URLs. [`demo/main.js`](demo/main.js) is a complete example.

The options you pass to `createLua` are those of the [Emscripten Module object](https://emscripten.org/docs/api_reference/module.html#affecting-execution). Functions that are macros in C, like `lua_pcall`, `lua_pop` and `lua_tostring`, are available too. [BUILDING](BUILDING.md#which-functions-are-exported) explains how.

### 64-bit integers

Since Lua 5.3 a `lua_Integer` is a 64-bit integer, which WebAssembly passes to and from JavaScript as a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). Functions such as `lua_pushinteger` and `lua_tointeger` therefore take and return BigInts:

```js
lua.lua_pushinteger(L, 42n)
let value = Number(lua.lua_tointeger(L, -1))
```

Passing a regular number where a `lua_Integer` is expected throws a `TypeError`. `lua_pushnumber` and `lua_tonumber` work with regular numbers.

## Maintenance & Contributing

Issues and Pull Requests are welcome. This project is meant to stay a small tool that builds Lua into WebAssembly, and nothing more.

_Every week a GitHub action checks for new Lua versions and builds [pre-releases](https://github.com/luttje/lua-wasm/releases) of them. These pass a few automated smoke tests, but are otherwise untested._

## Credits

I was inspired to make this when I came across [this repository by François Perrad](https://framagit.org/fperrad/lua.wasm). The `Makefile` that was based on it has since been replaced by a Node.js script.

[Lua](https://www.lua.org/) is a free and open-source project by Roberto Ierusalimschy and the rest of the [Lua team](https://www.lua.org/authors.html).

## License

This project is open-source under the [📜 MIT License](LICENSE)

For third-party license acknowledgements please refer to the [NOTICE](NOTICE) file
