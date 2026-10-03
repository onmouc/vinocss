import { describe, expect, it } from "vitest"
import { isExcluded } from "@/index"
import type { WorkspacePackage } from "@vinocss/devtools-build/workspace"

const root = "/workspace"

function pkgAt(rel: string, name: string): WorkspacePackage {
  return { dir: `/workspace/${rel}`, manifest: {}, name }
}

const scoped = pkgAt("packages/devtools-x", "@vinocss/devtools-x")
const foreign = pkgAt("packages/tools-x", "@acme/tools-x")
const unscoped = pkgAt("packages/tools-y", "tools-y")

describe("isExcluded", () => {
  it("matches a full package name", () => {
    expect(isExcluded(scoped, root, ["@vinocss/devtools-x"])).toBe(true)
  })

  it("matches a name without its scope", () => {
    expect(isExcluded(scoped, root, ["devtools-x"])).toBe(true)
  })

  it("matches a path from the workspace root", () => {
    expect(isExcluded(scoped, root, ["packages/devtools-x"])).toBe(true)
  })

  it("tolerates a leading dot and a trailing slash", () => {
    expect(isExcluded(scoped, root, ["./packages/devtools-x/"])).toBe(true)
  })

  it("drops whatever scope a package carries, not only the workspace one", () => {
    expect(isExcluded(foreign, root, ["tools-x"])).toBe(true)
    expect(isExcluded(foreign, root, ["@acme/tools-x"])).toBe(true)
    expect(isExcluded(foreign, root, ["packages/tools-x"])).toBe(true)
  })

  it("matches an unscoped package by its whole name", () => {
    expect(isExcluded(unscoped, root, ["tools-y"])).toBe(true)
  })

  it("keeps another scope from matching only on the bare name", () => {
    expect(isExcluded(foreign, root, ["@vinocss/tools-x"])).toBe(false)
  })

  it("keeps a package no selector names", () => {
    expect(isExcluded(scoped, root, ["devtools-y"])).toBe(false)
  })
})
