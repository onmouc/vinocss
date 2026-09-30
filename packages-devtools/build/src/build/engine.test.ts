import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { clean } from "@/build/engine"

describe("clean", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "vinocss-clean-"))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("clears every entry but keeps the directory", () => {
    const dir = join(root, "out")
    mkdirSync(join(dir, "nested"), { recursive: true })
    writeFileSync(join(dir, "file.js"), "")
    writeFileSync(join(dir, ".hidden"), "")
    writeFileSync(join(dir, "nested", "deep.js"), "")

    clean(dir)

    expect(existsSync(dir)).toBe(true)
    expect(existsSync(join(dir, "file.js"))).toBe(false)
    expect(existsSync(join(dir, ".hidden"))).toBe(false)
    expect(existsSync(join(dir, "nested"))).toBe(false)
  })

  it("throws for a path that is not a directory", () => {
    const file = join(root, "out")
    writeFileSync(file, "")
    expect(() => clean(file)).toThrow(`vinocss-build: ${file} is not a directory`)
  })
})
