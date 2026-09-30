import { createHash } from "node:crypto"
import type { Hash } from "node:crypto"
import { existsSync, readdirSync, statSync } from "node:fs"
import { isAbsolute, join, posix, relative, resolve, sep } from "node:path"

/**
 * The cache format version, mixed into every checksum.
 *
 * A tool change that alters the fingerprint bumps it, so every stale record misses at once.
 */
export const cacheVersion = 2

/**
 * The hashed fingerprint of a package, ready to store in a checksum record.
 */
export type Fingerprint = {
  checksum: string
  files: Record<string, number>
}

const sourceDirs = ["src", "bin"]
const sourceFiles = ["package.json"]
const tsconfigPattern = /^tsconfig.*\.json$/u
const testDirPattern = /(^|\/)(test|tests|__tests__)(\/|$)/u
const testFilePattern = /\.(test|spec)\.[^/]+$/u

/**
 * Compute the source and output fingerprint of a package.
 *
 * It hashes the sources a build reads and the files already in the output directory.
 * The output files belong to the key, so a build file changed or removed by hand counts as a change
 * and the next build restores it.
 */
export function computeChecksum(dir: string, outDir?: string): Fingerprint {
  return combine(readSources(dir), readOutputs(dir, outDir))
}

/**
 * Collect the source files of a package.
 *
 * It reads the `src` folder, the `bin` folder, `package.json`, and any root `tsconfig*.json`,
 * and it skips test files, since a test change cannot change the build.
 */
export function readSources(dir: string): Record<string, number> {
  const files: Record<string, number> = {}
  for (const name of sourceFiles) addFile(dir, name, files)
  for (const name of readdirSync(dir)) if (tsconfigPattern.test(name)) addFile(dir, name, files)
  for (const name of sourceDirs) {
    const base = resolve(dir, name)
    if (existsSync(base)) collectTree(base, name, files, true)
  }
  return files
}

/**
 * Collect the files already in a package output directory.
 *
 * A missing output directory yields an empty set, so a first build has nothing to compare.
 * Every file counts here, including one a test pattern would skip in the source,
 * since a build writes it.
 */
export function readOutputs(dir: string, outDir?: string): Record<string, number> {
  if (!outDir || !existsSync(outDir)) return {}
  const outputs: Record<string, number> = {}
  collectTree(outDir, outputPrefix(dir, outDir), outputs, false)
  return outputs
}

/**
 * Hash a source set and an output set into one fingerprint.
 *
 * Each set hashes in its own marked section, so a path shared by both stays unambiguous,
 * and the sorted paths keep the result stable across runs and platforms.
 */
export function combine(
  sources: Record<string, number>,
  outputs: Record<string, number>,
): Fingerprint {
  const hash = createHash("sha256")
  hash.update(`vinocss-build-cache:${cacheVersion}\n`)
  hash.update("sources\n")
  update(hash, sources)
  hash.update("outputs\n")
  update(hash, outputs)
  return { checksum: hash.digest("hex"), files: { ...sources, ...outputs } }
}

function update(hash: Hash, files: Record<string, number>): void {
  const sorted = Object.entries(files).toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  for (const [path, mtime] of sorted) hash.update(`${path}\n${mtime}\n`)
}

function collectTree(
  dir: string,
  rel: string,
  files: Record<string, number>,
  skipTests: boolean,
): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const childRel = posix.join(rel, entry.name)
    if (skipTests && (testDirPattern.test(childRel) || testFilePattern.test(childRel))) continue
    const child = join(dir, entry.name)
    if (entry.isDirectory()) collectTree(child, childRel, files, skipTests)
    else files[childRel] = statSync(child).mtimeMs
  }
}

function addFile(dir: string, name: string, files: Record<string, number>): void {
  const file = resolve(dir, name)
  const stat = statSync(file, { throwIfNoEntry: false })
  if (stat?.isFile()) files[name] = stat.mtimeMs
}

function outputPrefix(dir: string, outDir: string): string {
  const rel = relative(dir, outDir)
  if (rel === "") return "."
  return isAbsolute(rel) ? toPosix(outDir) : toPosix(rel)
}

function toPosix(path: string): string {
  return path.split(sep).join("/")
}
