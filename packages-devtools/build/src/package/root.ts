import { dirname, resolve } from "node:path"
import { isPackage } from "@/package/manifest"

/**
 * Walk up from a path to the nearest node package root, itself included.
 *
 * The search stops at the filesystem root, and it returns `undefined` when no ancestor holds a manifest.
 */
export function findPackageRoot(from: string): string | undefined {
  let dir = resolve(from)
  for (;;) {
    if (isPackage(dir)) return dir
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}
