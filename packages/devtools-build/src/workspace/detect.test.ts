import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { detectWorkspace } from "@/workspace/detect"
import type { Workspace } from "@/workspace/detect"

function writeWorkspace(root: string, text: string): void {
  writeFileSync(join(root, "pnpm-workspace.yaml"), text)
}

function writePackage(root: string, rel: string, value: object): string {
  const dir = join(root, rel)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "package.json"), JSON.stringify(value))
  return dir
}

function detected(root: string): Workspace {
  const workspace = detectWorkspace(root)
  if (!workspace) throw new Error("workspace not detected")
  return workspace
}

describe("detectWorkspace", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "vinocss-detect-"))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("collects the packages that match the globs", () => {
    writeWorkspace(root, "packages:\n  - packages/*\n  - packages-devtools/*\n")
    writePackage(root, "packages/a", { name: "a" })
    writePackage(root, "packages-devtools/b", { name: "b" })
    writePackage(root, "other/c", { name: "c" })
    expect(
      detected(root)
        .packages.map((entry) => entry.name)
        .toSorted(),
    ).toEqual(["a", "b"])
  })

  it("ignores node_modules and hidden directories", () => {
    writeWorkspace(root, 'packages:\n  - "**"\n')
    writePackage(root, "packages/a", { name: "a" })
    writePackage(root, "node_modules/skip", { name: "skip" })
    writePackage(root, ".hidden/skip", { name: "skip2" })
    expect(detected(root).packages.map((entry) => entry.name)).toEqual(["a"])
  })

  it("finds the workspace root above a nested directory", () => {
    writeWorkspace(root, "packages:\n  - packages/*\n")
    const dir = writePackage(root, "packages/a", { name: "a" })
    mkdirSync(join(dir, "src"))
    expect(detectWorkspace(join(dir, "src"))?.root).toBe(root)
  })
})
