import { existsSync } from "node:fs"
import { isBuiltin } from "node:module"
import { resolve } from "node:path"
import { readManifest } from "@/package/manifest"
import type { ExternalOption } from "rolldown"
import type { Context, Entry } from "@/types"

/**
 * Resolve entry names to the `src` files that exist.
 *
 * It checks `src/<name>.ts` first, then `src/<name>/index.ts`, so an entry can be one file or a folder.
 * It checks the fallback name first, then the names a caller asked for,
 * and it returns the matching files in that order.
 * The fallback is the entry a package is expected to have, such as `index` or `main`.
 *
 * 1. A fallback the package does not have is skipped in silence, since it is optional.
 * 2. A requested name the package does not have draws a warning, then a skip.
 * 3. A name that repeats is taken once, so a caller can list it safely.
 */
export function collect(context: Context, fallback: string, names: string[]): Entry[] {
  const entries = new Map<string, Entry>()
  for (const name of [fallback, ...names]) {
    if (entries.has(name)) continue
    const file = entryFile(context.cwd, name)
    if (file) entries.set(name, { name, file })
    else if (name !== fallback)
      context.report.warn?.(`no src/${name}.ts or src/${name}/index.ts, skipped`)
  }
  return [...entries.values()]
}

/**
 * Mark the dependencies a package declares, and every node builtin, as external.
 *
 * The build ships a package's own code, so it leaves the dependencies to the package manager,
 * which installs them and can keep one shared copy across the tree.
 * Bundling a dependency instead would duplicate it in every output,
 * and it can split a shared instance, such as a singleton, across two copies.
 * A node builtin stays external too, because the runtime provides it.
 *
 * A dependency also covers its subpaths, so `pkg/sub` stays external with `pkg`.
 * Dev dependencies stay out, since a package does not import them from its source.
 */
export function createExternal(cwd: string): ExternalOption {
  const names = new Set(dependencies(cwd))
  return (id: string) => {
    if (isBuiltin(id)) return true
    for (const name of names) if (id === name || id.startsWith(`${name}/`)) return true
    return false
  }
}

function entryFile(cwd: string, name: string): string | undefined {
  const file = resolve(cwd, "src", `${name}.ts`)
  if (existsSync(file)) return file
  const folder = resolve(cwd, "src", name, "index.ts")
  if (existsSync(folder)) return folder
  return undefined
}

function dependencies(cwd: string): string[] {
  const manifest = readManifest(cwd)
  if (!manifest) return []
  return [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ]
}
