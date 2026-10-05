import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { computeChecksum, readScriptSources } from "@/cache/fingerprint"

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

describe("fingerprint source set", () => {
  let root: string

  beforeEach(() => {
    root = sourceRoot()
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("includes a root build config file and the app template", () => {
    writeFileSync(join(root, "vite.config.ts"), "")
    writeFileSync(join(root, "index.html"), "")
    const files = Object.keys(computeChecksum(root).files)
    expect(files).toContain("vite.config.ts")
    expect(files).toContain("index.html")
  })

  it("includes a jsconfig file", () => {
    writeFileSync(join(root, "jsconfig.json"), "{}")
    expect(Object.keys(computeChecksum(root).files)).toContain("jsconfig.json")
  })

  it("skips a test-runner config", () => {
    writeFileSync(join(root, "vitest.config.ts"), "")
    writeFileSync(join(root, "rslib.config.ts"), "")
    const files = Object.keys(computeChecksum(root).files)
    expect(files).not.toContain("vitest.config.ts")
    expect(files).toContain("rslib.config.ts")
  })
})

describe("fingerprint script source set", () => {
  let root: string

  beforeEach(() => {
    root = sourceRoot()
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("includes the local file a script command names", () => {
    writeFileSync(join(root, "build.mjs"), "")
    writeFileSync(join(root, "src", "gen.ts"), "")
    const files = readScriptSources(root, "node build.mjs --flag x && node src/gen.ts")
    expect(Object.keys(files).toSorted()).toEqual(["build.mjs", "src/gen.ts"])
  })

  it("drops a script token under an output or dependency folder", () => {
    mkdirSync(join(root, "out"), { recursive: true })
    writeFileSync(join(root, "out", "tool.mjs"), "")
    expect(Object.keys(readScriptSources(root, "node out/tool.mjs"))).toEqual([])
  })
})
