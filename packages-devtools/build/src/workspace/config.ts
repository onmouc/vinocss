import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"

const workspaceFile = "pnpm-workspace.yaml"

/**
 * Find the workspace root above a path by locating `pnpm-workspace.yaml`.
 *
 * The path itself is checked first, then each ancestor up to the filesystem root.
 */
export function findWorkspaceRoot(from: string): string | undefined {
  let dir = resolve(from)
  for (;;) {
    if (existsSync(join(dir, workspaceFile))) return dir
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * Read the `packages` globs from a workspace file.
 *
 * The reader covers the pnpm list form, a `packages:` key followed by `- <glob>` lines.
 * It stops at the next top-level key, so a later field such as `catalogs` is left alone.
 */
export function readWorkspaceGlobs(root: string): string[] {
  const file = join(root, workspaceFile)
  const globs: string[] = []
  let inside = false
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/u)) {
    const line = raw.replaceAll(/#.*$/gu, "").trimEnd()
    if (/^packages\s*:/u.test(line)) {
      inside = true
      continue
    }
    if (!inside || line.trim() === "") continue
    const item = line.match(/^\s+-\s+(.+)$/u)
    if (item) {
      globs.push(unquote(item[1].trim()))
      continue
    }
    if (/^\S/u.test(line)) break
  }
  return globs
}

function unquote(value: string): string {
  const quoted =
    (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))
  return quoted ? value.slice(1, -1) : value
}
