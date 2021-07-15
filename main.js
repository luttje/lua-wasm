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

  for (const functionName in luaFunctions) {
    if (Object.hasOwnProperty.call(luaFunctions, functionName)) {
      const f = luaFunctions[functionName];
      
      window[functionName] = Module.cwrap(functionName, f.returnType ?? null, f.parameterTypes ?? undefined)
    }
  }
}

let luaState = null;
function evaluateLuaString(input) {
  if (luaState == null) {
    luaState = luaL_newstate();
    luaL_openlibs(luaState);
  }

  if (luaL_loadstring(luaState, input) == 0) {
    if (lua_pcallk(luaState, 0, -1, 0, 0) == 0) {
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
    let result = lua_tolstring(luaState, i);
    outputField.value += result + '\n';
  }
  lua_settop(luaState, -1 - stackSize);
}

function runLuaInput() {
  let input = inputField.value;
  outputField.value = '';
  statusLabel.innerHTML = "&#8986; Waiting ...";

  evaluateLuaString(input);
}