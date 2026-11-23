// Reads the Lua C API of an unpacked Lua release.
//
// Signatures come from the reference manual inside the release itself
// (doc/manual.html), so they always match the version being built. The
// headers then tell whether each name is a real function or a macro.

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const PUBLIC_HEADERS = ['lua.h', 'luaconf.h', 'lauxlib.h', 'lualib.h']

const HTML_ENTITIES = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&nbsp;': ' ', '&quot;': '"' }

function htmlToText(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim()
}

function splitParameters(text) {
  const parameters = []
  let depth = 0
  let current = ''

  for (const character of text) {
    if (character === '(') depth++
    if (character === ')') depth--

    if (character === ',' && depth === 0) {
      parameters.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  if (current.trim()) parameters.push(current.trim())

  return parameters
}

/**
 * Parses a parameter such as `const char *s` or `const luaL_Reg l[]`.
 * `type` is null when the manual gives no type, which it does for
 * type-generic macros like `luaL_opt (L, func, arg, dflt)`.
 */
function parseParameter(text) {
  const match = text.match(/^(.*?)(\w+)\s*(\[\])?$/)

  if (!match) return { type: null, name: text, isArray: false }

  const type = match[1].trim()

  return { type: type || null, name: match[2], isArray: Boolean(match[3]) }
}

/**
 * Parses a declaration such as `int lua_pcall (lua_State *L, int nargs);`.
 * Returns null for anything that is not a function-style declaration of
 * `name`, like the typedefs and structs the manual also documents.
 */
export function parseSignature(name, declaration) {
  const match = declaration.match(new RegExp(`^(.*?)\\b${name}\\s*\\((.*)\\)\\s*;?$`))

  if (!match || /\b(typedef|struct)\b/.test(match[1])) return null

  const returnType = match[1].trim()
  if (!returnType) return null

  const parameters = splitParameters(match[2])
  const isVariadic = parameters.at(-1) === '...'
  if (isVariadic) parameters.pop()

  const takesNothing = parameters.length === 1 && parameters[0] === 'void'

  return {
    name,
    returnType,
    parameters: takesNothing ? [] : parameters.map(parseParameter),
    isVariadic,
  }
}

/** Collects every documented `lua*` function signature from the manual. */
export function parseManual(html) {
  const signatures = []
  const sections = html.split(/<hr><h3><a name="(lua\w*)">/i)

  // split() with a capture group yields [intro, name, body, name, body, ...]
  for (let i = 1; i < sections.length; i += 2) {
    const declaration = sections[i + 1].match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
    if (!declaration) continue

    const signature = parseSignature(sections[i], htmlToText(declaration[1]))
    if (signature) signatures.push(signature)
  }

  return signatures
}

/** Finds which names the headers declare as functions and which as macros. */
export function parseHeaders(source) {
  const functions = new Set()
  const macros = new Set()

  for (const [, declaration] of source.matchAll(/^\s*(?:LUA_API|LUALIB_API)\b([^;]*);/gm)) {
    // Lua writes `LUA_API int (lua_gettop) (lua_State *L);`, with the name
    // in parentheses. Fall back to a plain `name (` for anything that isn't.
    const name = declaration.match(/\((lua\w*)\)\s*\(/) ?? declaration.match(/\b(lua\w*)\s*\(/)
    if (name) functions.add(name[1])
  }

  for (const [, name] of source.matchAll(/^\s*#\s*define\s+(lua\w*)\b/gm)) {
    macros.add(name)
  }

  return { functions, macros }
}

/**
 * Describes the documented C API of the Lua release in `sourceDir`.
 * Each entry is a parsed signature plus `kind: 'function' | 'macro'`.
 * Names the manual documents but the headers don't define are returned
 * separately in `unknown`.
 */
export async function readApi(sourceDir) {
  const manualPath = path.join(sourceDir, 'doc', 'manual.html')

  if (!existsSync(manualPath)) {
    throw new Error(`${manualPath} not found. Only Lua releases that ship their manual (5.1 and up) are supported.`)
  }

  const signatures = parseManual(await readFile(manualPath, 'utf8'))

  const headers = await Promise.all(
    PUBLIC_HEADERS.map((header) => path.join(sourceDir, 'src', header))
      .filter((headerPath) => existsSync(headerPath))
      .map((headerPath) => readFile(headerPath, 'utf8')),
  )
  const { functions, macros } = parseHeaders(headers.join('\n'))

  const api = []
  const unknown = []

  for (const signature of signatures) {
    if (functions.has(signature.name)) api.push({ ...signature, kind: 'function' })
    else if (macros.has(signature.name)) api.push({ ...signature, kind: 'macro' })
    else unknown.push(signature.name)
  }

  return { api, unknown }
}
