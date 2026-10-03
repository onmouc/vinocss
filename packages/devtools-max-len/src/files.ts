import { execFileSync } from "node:child_process"

const lockfiles = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
])

/**
 * Tell whether a path names a lockfile.
 *
 * A lockfile is generated, and it often keeps one long line per dependency,
 * so checking it would report noise a reader cannot act on.
 */
export function isLockfile(path: string): boolean {
  const name = path.slice(path.lastIndexOf("/") + 1)
  return lockfiles.has(name) || name.endsWith(".lock")
}

/**
 * List the files a check reads, in git order.
 *
 * It runs `git ls-files`, so a pattern is a full git pathspec,
 * and an ignore one is excluded with the `:!` prefix.
 * It lists a tracked file and an uncommitted file git does not ignore,
 * so a new file is checked before its first commit.
 * A lockfile is dropped, since a generated file is not worth checking.
 */
export function listFiles(cwd: string, patterns: string[], ignore: string[]): string[] {
  const pathspecs = [...patterns, ...ignore.map((pattern) => `:!${pattern}`)]
  const args = ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]
  if (pathspecs.length > 0) args.push("--", ...pathspecs)
  const output = execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  return output.split("\0").filter((file) => file !== "" && !isLockfile(file))
}
