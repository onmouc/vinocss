import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { createNodeHost } from "@/host"

describe("createNodeHost", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "vinocss-host-"))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("reads a file", () => {
    const file = join(root, "a.ts")
    writeFileSync(file, "export const a = 1\n")
    expect(createNodeHost().read(file)).toContain("export const a")
  })

  it("resolves a relative specifier through an extension", () => {
    writeFileSync(join(root, "theme.ts"), "")
    expect(createNodeHost().resolve("./theme", join(root, "app.ts"))).toBe(join(root, "theme.ts"))
  })

  it("resolves a directory to its index file", () => {
    mkdirSync(join(root, "theme"))
    writeFileSync(join(root, "theme", "index.ts"), "")
    expect(createNodeHost().resolve("./theme", join(root, "app.ts"))).toBe(
      join(root, "theme", "index.ts"),
    )
  })

  it("leaves a bare specifier unresolved", () => {
    expect(createNodeHost().resolve("vinocss", join(root, "app.ts"))).toBeUndefined()
  })
})
