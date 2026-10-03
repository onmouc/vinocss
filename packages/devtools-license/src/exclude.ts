import { relative } from "node:path"
import { toPosix } from "@vinocss/devtools-build/workspace"
import type { WorkspacePackage } from "@vinocss/devtools-build/workspace"

/**
 * Tell whether any selector skips a package.
 *
 * A selector matches a package in one of three forms:
 * 1. The full name, such as `@vinocss/devtools-license`.
 * 2. The name without its scope, such as `devtools-license`,
 *    whatever scope the package carries.
 * 3. The path from the workspace root, such as `packages/devtools-license`.
 *
 * The path form reads as the folder a person sees,
 * and the bare form spares a caller from repeating the shared scope.
 */
export function isExcluded(pkg: WorkspacePackage, root: string, exclude: string[]): boolean {
  const path = toPosix(relative(root, pkg.dir))
  const short = pkg.name.slice(pkg.name.lastIndexOf("/") + 1)
  return exclude.some((selector) => {
    const value = normalize(selector)
    return value === pkg.name || value === short || value === path
  })
}

function normalize(selector: string): string {
  return toPosix(selector.trim()).replace(/^\.\//u, "").replace(/\/+$/u, "")
}
