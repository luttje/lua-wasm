// ! THIS doesn't include ALL functions!
// Execute this on https://www.lua.org/manual/5.4/manual.html to get the luaFunctions to use in main.js

let luaFunctions = {};
let luaFunctionNamesConcat = '';
let extractFunction = /^((?:const )?[^\s]*) ([^\s]*) \(([^)]*)\);/;
let extractParameters = /([^,]+\(.+?\))|([^,]+)/g;
let functions = document.querySelectorAll('a[name^=lua]');

// TODO: Macro aliasses specified with #define are not visible to emcc... 
// TODO:  Therefore we ignore these functions which are defined in that way.
// Example error: `undefined exported symbol: "_lua_call"`
let skip = {
  lua_upvalueindex: true,
  lua_call: true,
  lua_pcall: true,
  lua_yield: true,
  lua_getextraspace: true,
  lua_tonumber: true,
  lua_tointeger: true,
  lua_pop: true,
  lua_newtable: true,
  lua_register: true,
  lua_pushcfunction: true,
  lua_isfunction: true,
  lua_istable: true,
  lua_islightuserdata: true,
  lua_isnil: true,
  lua_isboolean: true,
  lua_isthread: true,
  lua_isnone: true,
  lua_isnoneornil: true,
  lua_pushliteral: true,
  lua_pushglobaltable: true,
  lua_tostring: true,
  lua_insert: true,
  lua_remove: true,
  lua_replace: true,

  lua_numbertointeger: true,

  luaL_checkversion: true,
  luaL_loadfile: true,
  luaL_newlibtable: true,
  luaL_newlib: true,
  luaL_argcheck: true,
  luaL_argexpected: true,
  luaL_checkstring: true,
  luaL_optstring: true,
  luaL_typename: true,
  luaL_dofile: true,
  luaL_dostring: true,
  luaL_getmetatable: true,
  luaL_opt: true,
  luaL_loadbuffer: true,
  luaL_pushfail: true,
  lua_assert: true,
  luaL_bufflen: true,
  luaL_buffaddr: true,
  luaL_addchar: true,
  luaL_addsize: true,
  luaL_buffsub: true,
  luaL_prepbuffer: true,
  lua_writestring: true,
  lua_writeline: true,
  lua_writestringerror: true,
  luaL_checkunsigned: true,
  luaL_optunsigned: true,
  luaL_checkint: true,
  luaL_optint: true,
  luaL_checklong: true,
  luaL_optlong: true,
};

for (const el of functions) {
  if(skip[el.name] === true)
    continue;

	let signatureEl = el.closest('h3').nextSibling;

	while(signatureEl.tagName != 'PRE'){
		signatureEl = signatureEl.nextSibling;
	}

	const parts = signatureEl.innerText.match(extractFunction);

	if(parts == null){
		console.error(`Could not automatically generate wrapper for function signature: ${signatureEl.innerText}`);
	}else{
		let [, returnType,, parameters] = parts;

		let returns = (returnType == 'char' || returnType == 'const char') ? 'string' : 'number';
		let parameterTypes = [];

		parameters.match(extractParameters).forEach(p => {
			p = p.trim();
			
			if(p.startsWith('char') || p.startsWith('const char'))
				parameterTypes.push('string')
			else
				parameterTypes.push('number')
		});

		luaFunctions[el.name] = {
			returnType: returns,
			parameterTypes: parameterTypes
		};

    luaFunctionNamesConcat += ", '_" + el.name + "'"
	}
};
document.open();
document.write('For the Makefile: <textarea>EXPORTED_FUNCTIONS="[' + luaFunctionNamesConcat.substring(2) + ']"</textarea>');
document.write('For luafunctions.js: <textarea id="funcs">// See ./tools/extract-lua-signatures.js to get an idea how to build this\r\nlet luaFunctions = ' + JSON.stringify(luaFunctions, null, 2) + '</textarea>');
document.write('<button id="copy" onclick="document.querySelector(\'#funcs\').select();document.execCommand(\'copy\')">Copy</button>');
