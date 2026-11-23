// The build replaces this path with the versioned file, e.g. ./liblua-5.4.8.mjs
import createLua from './liblua.mjs';

const statusLabel = document.querySelector('#status');
const inputField = document.querySelector('#input');
const outputField = document.querySelector('#output');
const runButton = document.querySelector('#run');

function print(...values) {
  console.log(...values);
  outputField.value += values.join('\t') + '\n';
}

const lua = await createLua({ print, printErr: console.error });
const L = lua.luaL_newstate();
lua.luaL_openlibs(L);

function runLuaInput() {
  outputField.value = '';

  if (lua.luaL_loadstring(L, inputField.value) !== 0) {
    statusLabel.textContent = '⚠️ Your program failed to compile.';
  } else if (lua.lua_pcall(L, 0, -1, 0) !== 0) {
    statusLabel.textContent = '❌ Your program failed to run.';
  } else {
    statusLabel.textContent = `✅ Your program ran successfully and completed at ${new Date().toLocaleTimeString()}.`;
  }

  // Show whatever is left on the stack: return values or an error message
  const stackSize = lua.lua_gettop(L);

  for (let i = 1; i <= stackSize; i++) {
    outputField.value += lua.lua_tostring(L, i) + '\n';
  }

  lua.lua_pop(L, stackSize);
}

runButton.addEventListener('click', runLuaInput);
runButton.disabled = false;
runLuaInput();
