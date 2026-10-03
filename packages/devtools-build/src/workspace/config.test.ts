import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { readWorkspaceGlobs, workspaceGlobs } from "@/workspace/config"

describe("workspace config", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "vinocss-config-"))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("reads the packages globs and stops at the next key", () => {
    const text = "packages:\n  - packages/*\n  - tools/*\ncatalogs:\n  dep:\n    chalk: ^6\n"
    writeFileSync(join(root, "pnpm-workspace.yaml"), text)
    expect(readWorkspaceGlobs(root)).toEqual(["packages/*", "tools/*"])
  })

  it("finds the workspace above a path, and reports no globs without one", () => {
    const nested = join(root, "packages", "a")
    expect(workspaceGlobs(nested)).toEqual([])
    writeFileSync(join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n")
    expect(workspaceGlobs(nested)).toEqual(["packages/*"])
  })
})
