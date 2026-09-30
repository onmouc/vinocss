import { existsSync, readFileSync } from "node:fs"
import { isBuiltin } from "node:module"
import { resolve } from "node:path"
import type { ExternalOption } from "rolldown"
import type { Context, Entry } from "@/types"

/**
 * Resolve entry names to the `src/<name>.ts` files that exist.
 *
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
    const file = resolve(context.cwd, "src", `${name}.ts`)
    if (existsSync(file)) entries.set(name, { name, file })
    else if (name !== fallback) console.warn(`vinocss-build: no src/${name}.ts, skipped`)
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
 */
export function createExternal(cwd: string): ExternalOption {
  const names = new Set(dependencies(cwd))
  return (id: string) => {
    if (isBuiltin(id)) return true
    for (const name of names) if (id === name || id.startsWith(`${name}/`)) return true
    return false
  }
}

type Manifest = {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

function dependencies(cwd: string): string[] {
  const file = resolve(cwd, "package.json")
  if (!existsSync(file)) return []
  const manifest = JSON.parse(readFileSync(file, "utf8")) as Manifest
  return [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ]
}
