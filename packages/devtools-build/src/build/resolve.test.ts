import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { collect, createExternal } from "@/build/resolve"
import type { Context, Reporter } from "@/types"

let cwd: string

const silent: Reporter = {}

function setup(prefix: string): void {
  cwd = mkdtempSync(join(tmpdir(), prefix))
}

function teardown(): void {
  rmSync(cwd, { recursive: true, force: true })
  vi.restoreAllMocks()
}

function source(name: string): void {
  mkdirSync(join(cwd, "src"), { recursive: true })
  writeFileSync(join(cwd, "src", `${name}.ts`), "")
}

function folder(name: string): void {
  mkdirSync(join(cwd, "src", name), { recursive: true })
  writeFileSync(join(cwd, "src", name, "index.ts"), "")
}

function context(report: Reporter = silent): Context {
  return {
    cwd,
    outDir: join(cwd, "out"),
    tsconfig: join(cwd, "tsconfig.app.json"),
    external: () => false,
    report,
  }
}

function externalFor(): (id: string) => boolean {
  return createExternal(cwd) as (id: string) => boolean
}

function manifest(value: object): void {
  writeFileSync(join(cwd, "package.json"), JSON.stringify(value))
}

describe("collect", () => {
  beforeEach(() => setup("vinocss-collect-"))
  afterEach(teardown)

  it("returns the fallback entry when the file exists", () => {
    source("index")
    expect(collect(context(), "index", [])).toEqual([
      { name: "index", file: join(cwd, "src", "index.ts") },
    ])
  })

  it("takes a folder entry from src/<name>/index.ts", () => {
    folder("theme")
    expect(collect(context(), "theme", ["theme"])).toEqual([
      { name: "theme", file: join(cwd, "src", "theme", "index.ts") },
    ])
  })

  it("warns and skips a missing requested name", () => {
    source("index")
    const warn = vi.fn()
    expect(collect(context({ warn }), "index", ["missing"]).map((entry) => entry.name)).toEqual([
      "index",
    ])
    expect(warn).toHaveBeenCalledWith("no src/missing.ts or src/missing/index.ts, skipped")
  })
})

describe("createExternal", () => {
  beforeEach(() => setup("vinocss-external-"))
  afterEach(teardown)

  it("marks a declared dependency and its subpaths external", () => {
    manifest({ dependencies: { rolldown: "^1.2.11" } })
    const external = externalFor()
    expect(external("rolldown")).toBe(true)
    expect(external("rolldown/experimental")).toBe(true)
    expect(external("vue")).toBe(false)
  })

  it("includes peer and optional dependencies", () => {
    manifest({ peerDependencies: { typescript: "*" }, optionalDependencies: { fsevents: "*" } })
    const external = externalFor()
    expect(external("typescript")).toBe(true)
    expect(external("fsevents")).toBe(true)
  })
})
