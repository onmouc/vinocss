import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * The fields of a node package manifest that matter to the build.
 *
 * A manifest can carry anything else,
 * so an unknown field stays readable through the index signature.
 */
export type Manifest = {
  name?: string
  version?: string
  private?: boolean
  type?: string
  scripts?: Record<string, string>
  files?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  [field: string]: unknown
}

/**
 * A node package on disk, read from its `package.json`.
 */
export type PackageInfo = {
  dir: string
  manifest: Manifest
  name: string | undefined
}

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const

/**
 * Read the `package.json` of a directory.
 *
 * 1. A missing manifest returns `undefined`, so a caller can test for a package.
 * 2. A present manifest is parsed as JSON, so a malformed file throws.
 */
export function readManifest(dir: string): Manifest | undefined {
  const file = resolve(dir, "package.json")
  if (!existsSync(file)) return undefined
  return JSON.parse(readFileSync(file, "utf8")) as Manifest
}

/**
 * Tell whether a directory itself holds a `package.json`.
 */
export function isPackage(dir: string): boolean {
  return existsSync(resolve(dir, "package.json"))
}

/**
 * Read a directory as a node package.
 *
 * It returns `undefined` when the directory has no manifest,
 * and it keeps `name` undefined when the manifest omits one.
 */
export function readPackage(dir: string): PackageInfo | undefined {
  const manifest = readManifest(dir)
  if (!manifest) return undefined
  return { dir: resolve(dir), manifest, name: manifest.name }
}

/**
 * List every dependency name a manifest declares, across all four dependency kinds.
 *
 * A name that appears under more than one kind is listed once.
 */
export function dependencyNames(manifest: Manifest): string[] {
  const names = dependencyFields.flatMap((field) => Object.keys(manifest[field] ?? {}))
  return [...new Set(names)]
}

/**
 * Collect the dependency ranges a manifest declares, across all four dependency kinds.
 *
 * A later kind wins for a name that appears more than once, so the merged range stays predictable.
 */
export function dependencyRanges(manifest: Manifest): Record<string, string> {
  const ranges: Record<string, string> = {}
  for (const field of dependencyFields) Object.assign(ranges, manifest[field] ?? {})
  return ranges
}
