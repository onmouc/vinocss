import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { detectWorkspace } from "@/workspace/detect"
import { buildOrder, buildScript, dependencyOrder } from "@/workspace/order"
import type { Workspace, WorkspacePackage } from "@/workspace/detect"

function writeWorkspace(root: string, text: string): void {
  writeFileSync(join(root, "pnpm-workspace.yaml"), text)
}

function writePackage(root: string, rel: string, value: object): void {
  const dir = join(root, rel)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "package.json"), JSON.stringify(value))
}

function detected(root: string): Workspace {
  const workspace = detectWorkspace(root)
  if (!workspace) throw new Error("workspace not detected")
  return workspace
}

function named(workspace: Workspace, name: string): WorkspacePackage {
  const found = workspace.byName.get(name)
  if (!found) throw new Error(`package ${name} not detected`)
  return found
}

describe("build order", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "vinocss-order-"))
    writeWorkspace(root, "packages:\n  - packages/*\n")
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("orders each dependency before the package that needs it", () => {
    writePackage(root, "packages/a", { name: "a" })
    writePackage(root, "packages/b", { name: "b", dependencies: { a: "workspace:*" } })
    writePackage(root, "packages/c", { name: "c", dependencies: { b: "workspace:*" } })
    const order = buildOrder(detected(root)).map((entry) => entry.name)
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"))
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"))
  })

  it("lists only the transitive dependencies of a target, in order", () => {
    writePackage(root, "packages/a", { name: "a" })
    writePackage(root, "packages/b", { name: "b", dependencies: { a: "workspace:*" } })
    writePackage(root, "packages/c", { name: "c", dependencies: { b: "workspace:*" } })
    const workspace = detected(root)
    const order = dependencyOrder(workspace, named(workspace, "c"))
    expect(order.map((entry) => entry.name)).toEqual(["a", "b"])
  })

  it("counts a dev dependency as a build dependency", () => {
    writePackage(root, "packages/tool", { name: "tool" })
    writePackage(root, "packages/app", { name: "app", devDependencies: { tool: "workspace:*" } })
    const workspace = detected(root)
    const order = dependencyOrder(workspace, named(workspace, "app"))
    expect(order.map((entry) => entry.name)).toEqual(["tool"])
  })

  it("throws for a dependency cycle", () => {
    writePackage(root, "packages/a", { name: "a", dependencies: { b: "workspace:*" } })
    writePackage(root, "packages/b", { name: "b", dependencies: { a: "workspace:*" } })
    expect(() => buildOrder(detected(root))).toThrow(/dependency cycle/u)
  })
})

describe("build script", () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "vinocss-script-"))
    writeWorkspace(root, "packages:\n  - packages/*\n")
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("prefers build:self, then build, and honors a configured name", () => {
    writePackage(root, "packages/a", { name: "a", scripts: { build: "vite build" } })
    writePackage(root, "packages/b", {
      name: "b",
      scripts: { build: "vinocss-build", "build:self": "vinocss-build --self" },
    })
    writePackage(root, "packages/c", { name: "c", scripts: { compile: "tsc" } })
    const workspace = detected(root)
    expect(buildScript(named(workspace, "a"))).toBe("build")
    expect(buildScript(named(workspace, "b"))).toBe("build:self")
    expect(buildScript(named(workspace, "c"))).toBeUndefined()
    expect(buildScript(named(workspace, "c"), "compile")).toBe("compile")
  })

  it("skips a configured name instead of falling back to build", () => {
    writePackage(root, "packages/a", { name: "a", scripts: { build: "vite build" } })
    const workspace = detected(root)
    expect(buildScript(named(workspace, "a"), "compile")).toBeUndefined()
  })
})
