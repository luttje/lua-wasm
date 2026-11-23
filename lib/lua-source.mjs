// Finds, downloads and unpacks the official Lua source tarballs.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const LUA_FTP = 'https://www.lua.org/ftp/'
const VERSION_FORMAT = /^\d+\.\d+\.\d+$/

/** Sorts X.Y.Z version strings, oldest first. */
export function compareVersions(a, b) {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i]
  }

  return 0
}

async function download(url) {
  let response

  try {
    response = await fetch(url)
  } catch (error) {
    throw new Error(`Could not reach ${url} (${error.cause?.code ?? error.message})`)
  }

  if (!response.ok) throw new Error(`${url} responded with HTTP ${response.status}`)

  return response
}

/** Looks up the newest released Lua version on lua.org. */
export async function fetchLatestVersion() {
  const listing = await (await download(LUA_FTP)).text()
  const versions = [...listing.matchAll(/lua-(\d+\.\d+\.\d+)\.tar\.gz/g)].map((match) => match[1])

  if (versions.length === 0) throw new Error(`No Lua releases found on ${LUA_FTP}`)

  return versions.sort(compareVersions).at(-1)
}

/** Turns `latest` or an `X.Y.Z` string into a concrete version. */
export async function resolveVersion(requested) {
  if (requested === 'latest') return fetchLatestVersion()

  if (!VERSION_FORMAT.test(requested)) {
    throw new Error(`"${requested}" is not a Lua version. Use the X.Y.Z format (for example 5.4.8) or "latest".`)
  }

  return requested
}

/**
 * Makes sure the sources of the given Lua version are unpacked in the cache
 * directory and returns the path to them. Nothing is downloaded when a
 * previous build already did so.
 */
export async function fetchSource(version, cacheDir) {
  const name = `lua-${version}`
  const sourceDir = path.join(cacheDir, name)
  const tarball = `${name}.tar.gz`

  if (existsSync(path.join(sourceDir, 'src', 'lua.h'))) return sourceDir

  await mkdir(cacheDir, { recursive: true })

  if (!existsSync(path.join(cacheDir, tarball))) {
    console.log(`Downloading ${LUA_FTP}${tarball}`)
    const response = await download(LUA_FTP + tarball)
    await writeFile(path.join(cacheDir, tarball), Buffer.from(await response.arrayBuffer()))
  }

  // Run tar inside the cache directory with a relative file name: GNU tar
  // would read the colon in an absolute Windows path as a remote host.
  const tar = spawnSync('tar', ['-xzf', tarball], { cwd: cacheDir, stdio: 'inherit' })

  if (tar.error) throw new Error(`Could not run tar to unpack ${tarball}: ${tar.error.message}`)
  if (tar.status !== 0) throw new Error(`tar failed to unpack ${tarball} (exit code ${tar.status})`)

  return sourceDir
}
