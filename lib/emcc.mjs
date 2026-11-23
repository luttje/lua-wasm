// Compiles the Lua library to WebAssembly with Emscripten's emcc.

import { spawnSync } from 'node:child_process'
import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

// Sources that are programs or test helpers rather than part of the library.
const NOT_LIBRARY = new Set(['lua.c', 'luac.c', 'print.c', 'onelua.c', 'ltests.c'])

// The compatibility switches Lua's own Makefile turns on for each release.
const COMPAT_FLAGS = {
  5.2: ['-DLUA_COMPAT_ALL'],
  5.3: ['-DLUA_COMPAT_5_2'],
  5.4: ['-DLUA_COMPAT_5_3'],
}

const IS_WINDOWS = process.platform === 'win32'

function runEmcc(args, options = {}) {
  if (!IS_WINDOWS) return spawnSync('emcc', args, options)

  // On Windows emcc can be a .bat file, which Node only runs through a
  // shell. A shell splits the command on spaces, so quote arguments with any.
  const quoted = args.map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg))

  return spawnSync(['emcc', ...quoted].join(' '), { shell: true, ...options })
}

function assertEmccAvailable() {
  const result = runEmcc(['--version'], { stdio: 'ignore' })

  if (result.error || result.status !== 0) {
    throw new Error(
      'Could not run emcc. Install Emscripten (https://emscripten.org/docs/getting_started/downloads.html) ' +
        'and activate it so that emcc is on your PATH.',
    )
  }
}

/**
 * Compiles the Lua sources in `sourceDir` plus `extraSources` into
 * `<outDir>/<name>.js`, `.wasm` and `.html`, exporting `exportedNames`.
 * The HTML page is generated from `shellFile`.
 */
export async function compile({ sourceDir, version, extraSources, exportedNames, shellFile, outDir, name }) {
  assertEmccAvailable()

  const srcDir = path.join(sourceDir, 'src')
  const sources = (await readdir(srcDir)).filter((file) => file.endsWith('.c') && !NOT_LIBRARY.has(file))

  // The exports go in a file because there are too many of them for some
  // command lines. emcc wants C symbols prefixed with an underscore.
  const exportsFile = path.join(sourceDir, 'lua_wasm_exports.txt')
  await writeFile(exportsFile, exportedNames.map((exported) => `_${exported}`).join('\n'))

  const [major, minor] = version.split('.')

  const result = runEmcc(
    [
      '-O2',
      ...(COMPAT_FLAGS[`${major}.${minor}`] ?? []),
      '-I',
      srcDir,
      ...sources,
      ...extraSources,
      '-sEXPORTED_RUNTIME_METHODS=ccall,cwrap',
      `-sEXPORTED_FUNCTIONS=@${exportsFile}`,
      '--shell-file',
      shellFile,
      '-o',
      path.join(outDir, `${name}.html`),
    ],
    { cwd: srcDir, stdio: 'inherit' },
  )

  if (result.status !== 0) throw new Error(`emcc exited with code ${result.status}`)
}
