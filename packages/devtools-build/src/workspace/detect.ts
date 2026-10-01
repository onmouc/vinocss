import { readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { isPackage, readPackage } from "@/package/manifest"
import { findWorkspaceRoot, readWorkspaceGlobs } from "@/workspace/config"
import { globToRegExp, toPosix } from "@/workspace/glob"
import type { PackageInfo } from "@/package/manifest"

/**
 * A child package detected inside a workspace, with a name it must have.
 */
export type WorkspacePackage = PackageInfo & { name: string }

/**
 * A pnpm workspace, detected from `pnpm-workspace.yaml`.
 */
export type Workspace = {
  root: string
  packages: WorkspacePackage[]
  byName: Map<string, WorkspacePackage>
}

/**
 * Detect the pnpm workspace that holds a path.
 *
 * It walks up from the path to the nearest `pnpm-workspace.yaml`,
 * then reads the `packages` globs and collects every matching child package.
 * It returns `undefined` when no workspace file is found above the path,
 * so a package that is not in a workspace falls back to building itself.
 *
 * Only the pnpm layout is read; the workspace field of a root `package.json` is ignored.
 */
export function detectWorkspace(from = process.cwd()): Workspace | undefined {
  const root = findWorkspaceRoot(from)
  if (!root) return undefined
  const packages = collectPackages(root, readWorkspaceGlobs(root))
  return { root, packages, byName: new Map(packages.map((pkg) => [pkg.name, pkg])) }
}

function collectPackages(root: string, globs: string[]): WorkspacePackage[] {
  const matchers = globs.map((glob) => globToRegExp(glob))
  const packages: WorkspacePackage[] = []
  for (const dir of packageDirectories(root)) {
    const rel = toPosix(relative(root, dir))
    if (!matchers.some((matcher) => matcher.test(rel))) continue
    const pkg = readPackage(dir)
    if (!pkg?.name) continue
    packages.push({ ...pkg, name: pkg.name })
  }
  return packages
}

function* packageDirectories(root: string): Generator<string> {
  const stack = [root]
  while (stack.length > 0) {
    const dir = stack.pop() as string
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules")
        continue
      const child = join(dir, entry.name)
      if (isPackage(child)) yield child
      else stack.push(child)
    }
  }
}
