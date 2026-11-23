import { createPicker } from './picker.js';

const statusLabel = document.querySelector('#status');
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

// Every loaded Lua version keeps its own module and state, so switching back
// to a version is instant and keeps the globals of earlier runs.
const sessions = new Map();
let session = null;

/** Loads liblua-<version>.mjs once and starts a Lua state in it. */
function loadSession(version) {
  if (!sessions.has(version)) {
    const loading = (async () => {
      const { default: createLua } = await import(`./liblua-${version}.mjs`);
      const lua = await createLua({ print, printErr: console.error });
      const L = lua.luaL_newstate();
      lua.luaL_openlibs(L);

      return { lua, L };
    })();

    // Forget failed attempts so picking the version again retries
    loading.catch(() => sessions.delete(version));
    sessions.set(version, loading);
  }

  return sessions.get(version);
}

/** Runs a string of Lua and returns whether it worked. */
function runLua(code) {
  const { lua, L } = session;

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
  const { lua, L } = session;
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
  if (!session) return;

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

runButton.addEventListener('click', () => runLuaInput());

// The build lists the Lua versions next to this page, newest first
let versions = [];

try {
  const response = await fetch('versions.json');
  if (!response.ok) throw new Error(`versions.json responded with HTTP ${response.status}`);
  versions = await response.json();
} catch (error) {
  console.error(error);
  setStatus('error', 'No Lua builds found');
}

const picker = createPicker(
  document.querySelector('#picker'),
  versions.map((version, index) => ({ value: version, label: `Lua ${version}`, tag: index === 0 ? 'latest' : null })),
  (version) => useVersion(version),
);

let wanted = null;

/** Switches to a Lua version, loading it first when needed, then runs the code. */
async function useVersion(version) {
  wanted = version;
  picker.select(version);

  // Remember the choice in the address, so the link opens the same version
  const url = new URL(location.href);
  if (version === versions[0]) url.searchParams.delete('lua');
  else url.searchParams.set('lua', version);
  history.replaceState(null, '', url);

  runButton.disabled = true;
  picker.setBusy(true);
  setStatus('loading', `Loading Lua ${version}…`);

  try {
    const loaded = await loadSession(version);
    if (wanted !== version) return; // Another version was picked meanwhile

    session = loaded;
    runButton.disabled = false;
    runLuaInput({ scroll: false });
  } catch (error) {
    if (wanted !== version) return;

    console.error(error);
    session = null;
    setStatus('error', `Could not load Lua ${version}`);
  } finally {
    if (wanted === version) picker.setBusy(false);
  }
}

if (versions.length > 0) {
  const requested = new URLSearchParams(location.search).get('lua');

  picker.setDisabled(false);
  useVersion(versions.includes(requested) ? requested : versions[0]);
}
