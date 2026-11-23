// The build replaces this path with the versioned file, e.g. ./liblua-5.4.8.mjs
import createLua from './liblua.mjs';

const statusLabel = document.querySelector('#status');
const versionLabel = document.querySelector('#version');
const inputField = document.querySelector('#input');
const outputField = document.querySelector('#output');
const runButton = document.querySelector('#run');
const outputCard = document.querySelector('.output');

function setStatus(state, text) {
  statusLabel.dataset.state = state;
  statusLabel.textContent = text;
}

function print(...values) {
  console.log(...values);
  outputField.textContent += values.join('\t') + '\n';
}

const lua = await createLua({ print, printErr: console.error });
const L = lua.luaL_newstate();
lua.luaL_openlibs(L);

/** Runs a string of Lua and returns whether it worked. */
function runLua(code) {
  if (lua.luaL_loadstring(L, code) !== 0) {
    setStatus('warn', 'Failed to compile');
    return false;
  }

  if (lua.lua_pcall(L, 0, -1, 0) !== 0) {
    setStatus('error', 'Failed to run');
    return false;
  }

  setStatus('ok', `Ran at ${new Date().toLocaleTimeString()}`);
  return true;
}

/** Removes everything from the stack and returns it as strings. */
function popAll() {
  const values = [];

  for (let i = 1; i <= lua.lua_gettop(L); i++) {
    values.push(lua.lua_tostring(L, i));
  }

  lua.lua_settop(L, 0);
  return values;
}

/** Restarts the CSS animation that `className` adds, even if it ran before. */
function replay(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // Makes the browser notice the class was gone
  element.classList.add(className);
}

/** Runs the editor contents. Only a run by the user scrolls the output into view. */
function runLuaInput({ scroll = true } = {}) {
  outputField.textContent = '';

  const succeeded = runLua(inputField.value);
  const values = popAll();

  // Show what the code returned, or the error message
  if (values.length > 0) {
    outputField.textContent += (succeeded ? '→ ' : '') + values.join('\t') + '\n';
  }

  // Make it obvious that this is fresh output, also when Ctrl + Enter was used
  replay(runButton, 'ran');
  replay(outputCard, 'ran');
  if (scroll) {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    outputCard.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}

// Ctrl/Cmd + Enter runs the code and Tab indents instead of leaving the editor
inputField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    runLuaInput();
  } else if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault();
    inputField.setRangeText('  ', inputField.selectionStart, inputField.selectionEnd, 'end');
  }
});

if (runLua('return _VERSION')) {
  versionLabel.textContent = popAll()[0];
  versionLabel.hidden = false;
}

runButton.addEventListener('click', () => runLuaInput());
runButton.disabled = false;
runLuaInput({ scroll: false });
