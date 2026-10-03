import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { syncLicenses } from "@/index"
import type { LicenseResult, PackageAction } from "@/index"

const text = "The MIT License (MIT)\n"
let dir = ""

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "license-"))
  writeFileSync(join(dir, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n")
  writeFileSync(join(dir, "LICENSE"), text)
  addPackage("devtools-a")
  addPackage("devtools-b")
})

afterEach(() => rmSync(dir, { recursive: true, force: true }))

function addPackage(name: string, scope = "vinocss", isPrivate = false): string {
  const folder = join(dir, "packages", name)
  mkdirSync(folder, { recursive: true })
  const manifest = { name: `@${scope}/${name}`, private: isPrivate || undefined }
  writeFileSync(join(folder, "package.json"), JSON.stringify(manifest))
  return folder
}

function action(result: LicenseResult, name: string): PackageAction | undefined {
  return result.packages.find((pkg) => pkg.name === name)?.action
}

describe("syncLicenses", () => {
  it("writes the root license into every child package", () => {
    const result = syncLicenses({ cwd: dir })
    expect(result.packages.map((pkg) => pkg.action).toSorted()).toEqual(["written", "written"])
    expect(readFileSync(join(dir, "packages/devtools-a/LICENSE"), "utf8")).toBe(text)
    expect(readFileSync(join(dir, "packages/devtools-b/LICENSE"), "utf8")).toBe(text)
  })

  it("keeps a package that already carries the license", () => {
    syncLicenses({ cwd: dir })
    const second = syncLicenses({ cwd: dir })
    expect(second.packages.every((pkg) => pkg.action === "unchanged")).toBe(true)
  })

  it("skips an excluded package and writes the rest", () => {
    const result = syncLicenses({ cwd: dir, exclude: ["devtools-a"] })
    expect(action(result, "@vinocss/devtools-a")).toBe("excluded")
    expect(action(result, "@vinocss/devtools-b")).toBe("written")
  })

  it("leaves no license behind for an excluded package", () => {
    syncLicenses({ cwd: dir, exclude: ["packages/devtools-b"] })
    expect(() => readFileSync(join(dir, "packages/devtools-b/LICENSE"))).toThrow()
  })

  it("excludes a package in another scope by its bare name", () => {
    const folder = addPackage("tools-x", "acme")
    const result = syncLicenses({ cwd: dir, exclude: ["tools-x"] })
    expect(action(result, "@acme/tools-x")).toBe("excluded")
    expect(() => readFileSync(join(folder, "LICENSE"))).toThrow()
  })

  it("warns when the workspace root license is missing", () => {
    rmSync(join(dir, "LICENSE"))
    const warn = vi.fn()
    const result = syncLicenses({ cwd: dir, report: { warn } })
    expect(warn).toHaveBeenCalledOnce()
    expect(result.source).toBeUndefined()
  })

  it("warns when no workspace is found", () => {
    const outside = mkdtempSync(join(tmpdir(), "license-none-"))
    const warn = vi.fn()
    const result = syncLicenses({ cwd: outside, report: { warn } })
    expect(warn).toHaveBeenCalledOnce()
    expect(result.root).toBeUndefined()
    rmSync(outside, { recursive: true, force: true })
  })
})

describe("syncLicenses private packages", () => {
  it("skips a private package and writes the rest", () => {
    addPackage("example-x", "vinocss", true)
    const result = syncLicenses({ cwd: dir })
    expect(action(result, "@vinocss/example-x")).toBe("private")
    expect(() => readFileSync(join(dir, "packages/example-x/LICENSE"))).toThrow()
  })

  it("leaves a license already sitting on a private package alone", () => {
    const folder = addPackage("example-x", "vinocss", true)
    writeFileSync(join(folder, "LICENSE"), "old\n")
    const result = syncLicenses({ cwd: dir })
    expect(action(result, "@vinocss/example-x")).toBe("private")
    expect(readFileSync(join(folder, "LICENSE"), "utf8")).toBe("old\n")
  })
})
