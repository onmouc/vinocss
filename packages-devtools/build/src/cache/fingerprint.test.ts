import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { computeChecksum } from "@/cache/fingerprint"

function sourceRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "vinocss-fingerprint-"))
  mkdirSync(join(root, "src"), { recursive: true })
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "a" }))
  writeFileSync(join(root, "src", "index.ts"), "export const a = 1\n")
  return root
}

describe("computeChecksum", () => {
  let root: string

  beforeEach(() => {
    root = sourceRoot()
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("fingerprints the source files by relative path", () => {
    expect(Object.keys(computeChecksum(root).files).toSorted()).toEqual([
      "package.json",
      "src/index.ts",
    ])
  })

  it("includes a root tsconfig file", () => {
    writeFileSync(join(root, "tsconfig.app.json"), "{}")
    expect(Object.keys(computeChecksum(root).files)).toContain("tsconfig.app.json")
  })

  it("includes a file already in the output directory", () => {
    mkdirSync(join(root, "out"), { recursive: true })
    writeFileSync(join(root, "out", "index.js"), "")
    expect(Object.keys(computeChecksum(root, join(root, "out")).files)).toContain("out/index.js")
  })

  it("skips test files and test folders", () => {
    writeFileSync(join(root, "src", "index.test.ts"), "")
    mkdirSync(join(root, "src", "test"), { recursive: true })
    writeFileSync(join(root, "src", "test", "span.ts"), "")
    expect(Object.keys(computeChecksum(root).files).toSorted()).toEqual([
      "package.json",
      "src/index.ts",
    ])
  })

  it("changes when a source file changes or is added", () => {
    const before = computeChecksum(root).checksum
    const time = new Date(Date.now() + 5000)
    utimesSync(join(root, "src", "index.ts"), time, time)
    expect(computeChecksum(root).checksum).not.toBe(before)

    const next = computeChecksum(root).checksum
    writeFileSync(join(root, "src", "extra.ts"), "")
    expect(computeChecksum(root).checksum).not.toBe(next)
  })
})
