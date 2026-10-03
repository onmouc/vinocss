import { sep } from "node:path"

/**
 * Turn a workspace glob into a regular expression over a posix relative path.
 *
 * 1. `*` matches within one path segment, and `?` matches a single character.
 * 2. `**` matches across segments, and `**\/` also matches zero segments.
 * 3. Every other character is matched literally.
 *
 * ## Throws
 *
 * A glob is a small pattern, so a wildcard-heavy one can make the regex
 * backtrack badly on a long path. Two shapes are refused:
 *
 * - A glob longer than 256 characters.
 * - A glob that holds more than 8 wildcards.
 */
export function globToRegExp(glob: string): RegExp {
  const maxGlobLength = 256
  const maxWildcards = 8
  if (glob.length > maxGlobLength)
    throw new Error(`vinocss-build: workspace glob is too long: ${glob}`)
  let pattern = "^"
  let wildcards = 0
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i]
    if (char === "*") {
      wildcards++
      if (glob[i + 1] === "*") {
        i++
        if (glob[i + 1] === "/") {
          i++
          pattern += "(?:.*/)?"
        } else pattern += ".*"
      } else pattern += "[^/]*"
    } else if (char === "?") {
      wildcards++
      pattern += "[^/]"
    } else pattern += escapeRegExp(char)
  }
  if (wildcards > maxWildcards)
    throw new Error(`vinocss-build: workspace glob has too many wildcards: ${glob}`)
  return new RegExp(`${pattern}$`, "u")
}

/**
 * Convert a path to posix separators, so a glob match does not depend on the platform.
 */
export function toPosix(path: string): string {
  return path.split(sep).join("/")
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&")
}
