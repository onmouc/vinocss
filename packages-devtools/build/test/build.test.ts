import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { build, buildSelf } from "@/index"

function fixture(): string {
  const cwd = mkdtempSync(join(tmpdir(), "vinocss-build-"))
  mkdirSync(join(cwd, "src"))
  writeFileSync(join(cwd, "package.json"), JSON.stringify({ type: "module" }))
  writeFileSync(
    join(cwd, "tsconfig.app.json"),
    JSON.stringify({
      compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "bundler" },
    }),
  )
  return cwd
}

function remove(cwd: string): void {
  rmSync(cwd, { recursive: true, force: true })
  vi.restoreAllMocks()
}

describe("build", () => {
  let cwd: string

  beforeEach(() => {
    cwd = fixture()
  })

  afterEach(() => {
    remove(cwd)
  })

  it("builds the library and binary entries into out", async () => {
    writeFileSync(join(cwd, "src", "index.ts"), "export const answer = 42\n")
    writeFileSync(join(cwd, "src", "main.ts"), "#!/usr/bin/env node\nconsole.log('hi')\n")

    await build({ cwd })

    expect(existsSync(join(cwd, "out", "index.js"))).toBe(true)
    expect(existsSync(join(cwd, "out", "index.cjs"))).toBe(true)
    expect(existsSync(join(cwd, "out", "index.d.ts"))).toBe(true)
    expect(existsSync(join(cwd, "out", "main.js"))).toBe(true)
  })

  it("warns and leaves no output when no entry exists", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    await build({ cwd })

    expect(warn).toHaveBeenCalledWith("vinocss-build: no entries found")
    expect(existsSync(join(cwd, "out"))).toBe(false)
  })
})

describe("build cache", () => {
  let cwd: string

  beforeEach(() => {
    cwd = fixture()
  })

  afterEach(() => {
    remove(cwd)
  })

  it("skips a package whose source did not change", async () => {
    writeFileSync(join(cwd, "src", "index.ts"), "export const answer = 42\n")

    expect(await buildSelf({ cwd })).toBe(true)
    expect(await buildSelf({ cwd })).toBe(false)
  })

  it("builds again when forced", async () => {
    writeFileSync(join(cwd, "src", "index.ts"), "export const answer = 42\n")

    await buildSelf({ cwd })
    expect(await buildSelf({ cwd, force: true })).toBe(true)
  })

  it("drops the record when a build fails, so the next run rebuilds", async () => {
    const source = join(cwd, "src", "index.ts")
    writeFileSync(source, "export const answer = 42\n")
    await buildSelf({ cwd })

    writeFileSync(source, "export const = 1\n")
    await expect(buildSelf({ cwd })).rejects.toThrow()

    expect(existsSync(join(cwd, "node_modules", "vinocss-build-checksum"))).toBe(false)
  })
})
