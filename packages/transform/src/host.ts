import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import type { Host } from "@/value"

const extensions = ["", ".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]
const indexes = [
  "index.ts",
  "index.tsx",
  "index.mts",
  "index.cts",
  "index.js",
  "index.jsx",
  "index.mjs",
  "index.cjs",
]

/**
 * A host that reads modules and follows imports on the real filesystem.
 *
 * It resolves a relative or absolute specifier to a file with a TypeScript or
 * JavaScript extension or an index file, so the compiler can walk a project
 * the way the bundler does. A bare package specifier is left unresolved.
 */
export function createNodeHost(): Host {
  return {
    read(id) {
      try {
        return readFileSync(id, "utf8")
      } catch {
        // A missing or unreadable file has no source, so the read is absent.
      }
    },
    resolve(specifier, importer) {
      if (!specifier.startsWith(".") && !isAbsolute(specifier)) return
      const base = isAbsolute(specifier) ? specifier : resolve(dirname(importer), specifier)
      const file = firstFile(base)
      if (file) return file
      for (const name of indexes) {
        const candidate = join(base, name)
        if (isFile(candidate)) return candidate
      }
    },
  }
}

function firstFile(base: string): string | undefined {
  for (const extension of extensions) {
    const candidate = `${base}${extension}`
    if (isFile(candidate)) return candidate
  }
}

function isFile(path: string): boolean {
  if (!existsSync(path)) return false
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}
