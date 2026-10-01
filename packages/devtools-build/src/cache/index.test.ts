import { mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { checksumFile, isCached, saveChecksum } from "@/cache"

function sourceRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "vinocss-record-"))
  mkdirSync(join(root, "src"), { recursive: true })
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "a" }))
  writeFileSync(join(root, "src", "index.ts"), "export const a = 1\n")
  return root
}

describe("checksum record", () => {
  let root: string

  beforeEach(() => {
    root = sourceRoot()
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("writes the record into node_modules", () => {
    mkdirSync(join(root, "out"))
    saveChecksum(root, join(root, "out"))
    const file = checksumFile(root)
    expect(file).toBe(join(root, "node_modules", "vinocss-build-checksum"))
    expect(JSON.parse(readFileSync(file, "utf8")).outDir).toBe(join(root, "out"))
  })

  it("hits only while the output exists and the sources match", () => {
    saveChecksum(root, join(root, "out"))
    expect(isCached(root)).toBe(false)

    mkdirSync(join(root, "out"))
    expect(isCached(root)).toBe(true)

    const time = new Date(Date.now() + 5000)
    utimesSync(join(root, "src", "index.ts"), time, time)
    expect(isCached(root)).toBe(false)
  })

  it("misses when the output directory is gone", () => {
    mkdirSync(join(root, "out"))
    saveChecksum(root, join(root, "out"))
    rmSync(join(root, "out"), { recursive: true })
    expect(isCached(root)).toBe(false)
  })
})

describe("output key", () => {
  let root: string

  beforeEach(() => {
    root = sourceRoot()
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("misses when asked for a different output directory", () => {
    mkdirSync(join(root, "out"))
    mkdirSync(join(root, "dist"))
    saveChecksum(root, join(root, "out"))
    expect(isCached(root, join(root, "out"))).toBe(true)
    expect(isCached(root, join(root, "dist"))).toBe(false)
  })

  it("misses when an output file changes or goes missing", () => {
    mkdirSync(join(root, "out"))
    const file = join(root, "out", "index.js")
    writeFileSync(file, "built")
    saveChecksum(root, join(root, "out"))
    expect(isCached(root)).toBe(true)

    const time = new Date(Date.now() + 5000)
    utimesSync(file, time, time)
    expect(isCached(root)).toBe(false)

    saveChecksum(root, join(root, "out"))
    rmSync(file)
    expect(isCached(root)).toBe(false)
  })
})
