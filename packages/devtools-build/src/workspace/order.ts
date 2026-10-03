import { resolve, sep } from "node:path"
import { dependencyNames } from "@/package/manifest"
import type { Workspace, WorkspacePackage } from "@/workspace/detect"

/**
 * Find the workspace package that owns a path, itself included.
 *
 * It returns the package whose directory is the path or an ancestor of it,
 * so a caller can map a nested working directory back to its package.
 */
export function packageAt(workspace: Workspace, dir: string): WorkspacePackage | undefined {
  const target = resolve(dir)
  return workspace.packages.find(
    (pkg) => target === pkg.dir || target.startsWith(`${pkg.dir}${sep}`),
  )
}

/**
 * List the direct workspace dependencies of a package.
 *
 * A dependency counts when its name matches another package in the same workspace,
 * whatever dependency kind declares it, and a repeated name is listed once.
 */
export function workspaceDependencies(
  pkg: WorkspacePackage,
  workspace: Workspace,
): WorkspacePackage[] {
  const deps = dependencyNames(pkg.manifest)
    .map((name) => workspace.byName.get(name))
    .filter((dep): dep is WorkspacePackage => dep !== undefined)
  return [...new Set(deps)]
}

/**
 * List the transitive workspace dependencies of a package in build order.
 *
 * The result holds every dependency before the package that needs it,
 * and it leaves the package out.
 *
 * ## Throws
 *
 * - A dependency cycle, since a build order cannot exist for it.
 */
export function dependencyOrder(
  workspace: Workspace,
  target: WorkspacePackage,
): WorkspacePackage[] {
  const seeds = workspaceDependencies(target, workspace)
  return sortPackages(workspace, seeds).filter((pkg) => pkg.name !== target.name)
}

/**
 * List every workspace package in build order.
 *
 * Each dependency comes before the package that needs it.
 * Independent packages follow the name order, so a build stays deterministic.
 *
 * ## Throws
 *
 * - A dependency cycle, since a build order cannot exist for it.
 */
export function buildOrder(workspace: Workspace): WorkspacePackage[] {
  const seeds = workspace.packages.toSorted((a, b) => a.name.localeCompare(b.name))
  return sortPackages(workspace, seeds)
}

/**
 * Pick the script that builds a package on its own.
 *
 * It prefers `build:self`, the script that skips the workspace dependencies,
 * since the caller already ordered and built those.
 * It falls back to `build`, and it returns `undefined` when the package declares neither.
 */
export function buildScript(pkg: WorkspacePackage): string | undefined {
  const scripts = pkg.manifest.scripts ?? {}
  if (scripts["build:self"]) return "build:self"
  if (scripts.build) return "build"
  return undefined
}

/**
 * Depth-first sort of the seeded packages and their workspace dependencies.
 *
 * A dependency lands before the package that needs it,
 * and a package that revisits an open node is a cycle.
 * The traversal state is shared across seeds, so a package reached twice is emitted once.
 */
function sortPackages(workspace: Workspace, seeds: WorkspacePackage[]): WorkspacePackage[] {
  const order: WorkspacePackage[] = []
  const open = new Set<string>()
  const done = new Set<string>()
  const visit = (pkg: WorkspacePackage): void => {
    if (done.has(pkg.name)) return
    if (open.has(pkg.name)) throw new Error(cycleMessage(workspace, pkg))
    open.add(pkg.name)
    for (const dep of workspaceDependencies(pkg, workspace)) visit(dep)
    open.delete(pkg.name)
    done.add(pkg.name)
    order.push(pkg)
  }
  for (const pkg of seeds) visit(pkg)
  return order
}

function cycleMessage(workspace: Workspace, pkg: WorkspacePackage): string {
  return `vinocss-build: dependency cycle through ${pkg.name} in ${workspace.root}`
}
