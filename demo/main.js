const statusLabel = document.querySelector('#status');
const inputField = document.querySelector('#input');
const outputField = document.querySelector('#output');

var Module = {
  preRun: [initWrappers],
  postRun: [runLuaInput],
  print: function(text) {
    if (arguments.length > 1)
      text = Array.prototype.slice.call(arguments).join('\t');
    
    console.log(text);  
    outputField.value += text + '\n';
  },
  printErr: function(text) {
    if (arguments.length > 1)
      text = Array.prototype.slice.call(arguments).join('\t');
    
    console.error(text);
  }
};

function initWrappers(){
  console.log('Wrapping Lua functions');

  // luaFunctions comes from the generated luafunctions.js. Every function of
  // the Lua C API becomes a global with the same name as in C.
  for (const [name, { returnType, parameterTypes }] of Object.entries(luaFunctions)) {
    window[name] = Module.cwrap(name, returnType, parameterTypes);
  }
}

let luaState = null;
function evaluateLuaString(input) {
  if (luaState == null) {
    luaState = luaL_newstate();
    luaL_openlibs(luaState);
  }

  if (luaL_loadstring(luaState, input) == 0) {
    if (lua_pcall(luaState, 0, -1, 0) == 0) {
      statusLabel.innerHTML = `&#9989; Your program ran successfully and completed at ${new Date().toLocaleTimeString()}.`;
    }
    else {
      statusLabel.innerHTML = "&#10060; Your program failed to run.";
    }
  }
  else {
    statusLabel.innerHTML = "&#9888; Your program failed to compile.";
  }
  
  let stackSize = lua_gettop(luaState);

  for (let i = 1; i <= stackSize; i++) {
    let result = lua_tostring(luaState, i);
    outputField.value += result + '\n';
  }
  lua_pop(luaState, stackSize);
}

function runLuaInput() {
  let input = inputField.value;
  outputField.value = '';
  statusLabel.innerHTML = "&#8986; Waiting ...";

  evaluateLuaString(input);
}