import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { cacheVersion, combine, readOutputs, readSources } from "@/cache/fingerprint"

/**
 * The record kept in a package's checksum file.
 *
 * 1. `checksum` is the hash of every source and output fingerprint at the last successful build.
 * 2. `files` maps each source and output file, relative to the package root, to its last modified time.
 * 3. `outDir` is the absolute output directory the build wrote, so a cache hit can confirm it exists.
 */
export type ChecksumRecord = {
  version: number
  checksum: string
  outDir: string
  files: Record<string, number>
}

const cacheFileName = "vinocss-build-checksum"

/**
 * Tell whether a package can skip its build.
 *
 * A hit needs a record from the current cache version,
 * the recorded output directory present on disk,
 * and a fingerprint that still matches the sources and the current output files.
 * The output directory is part of the key, so a build into a different `--out` misses,
 * and a build file changed or removed by hand misses too.
 * A caller may pass the source fingerprint it already read, so a build walks the source tree once.
 */
export function isCached(dir: string, outDir?: string, sources?: Record<string, number>): boolean {
  const record = readChecksum(dir)
  if (!record || record.version !== cacheVersion) return false
  const target = outDir ?? record.outDir
  if (!target || target !== record.outDir || !existsSync(target)) return false
  const current = combine(sources ?? readSources(dir), readOutputs(dir, target))
  return current.checksum === record.checksum
}

/**
 * Write the source and output fingerprint of a package as its checksum record.
 *
 * It creates the package `node_modules` folder when it is missing,
 * so a package without dependencies can still keep a record.
 * A caller may pass the source fingerprint it already read, so a build walks the source tree once.
 */
export function saveChecksum(
  dir: string,
  outDir: string,
  sources?: Record<string, number>,
): ChecksumRecord {
  const fingerprint = combine(sources ?? readSources(dir), readOutputs(dir, outDir))
  const record: ChecksumRecord = {
    version: cacheVersion,
    checksum: fingerprint.checksum,
    outDir,
    files: fingerprint.files,
  }
  const file = checksumFile(dir)
  mkdirSync(resolve(file, ".."), { recursive: true })
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`)
  return record
}

/**
 * Remove the checksum record of a package, so the next build runs.
 */
export function clearChecksum(dir: string): void {
  rmSync(checksumFile(dir), { force: true })
}

/**
 * Name the checksum file of a package, which lives in its own `node_modules`.
 */
export function checksumFile(dir: string): string {
  return resolve(dir, "node_modules", cacheFileName)
}

/**
 * Read the checksum record of a package.
 *
 * A missing or unreadable file returns `undefined`, so a broken cache reads as a miss.
 */
function readChecksum(dir: string): ChecksumRecord | undefined {
  const file = checksumFile(dir)
  if (!existsSync(file)) return undefined
  try {
    return JSON.parse(readFileSync(file, "utf8")) as ChecksumRecord
  } catch {
    return undefined
  }
}
