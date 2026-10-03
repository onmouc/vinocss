import { Compiler } from "@/compiler"
import type { CompileResult } from "@/compiler"
import type { Host } from "@/value"

/**
 * Build a host over a fixed map of module id to source.
 *
 * A relative specifier resolves against the importing module, trying the file
 * itself, a `.ts` neighbour, and an `index.ts`, which is enough to model the
 * multi-file cases a behavior test needs.
 */
export function memoryHost(files: Record<string, string>): Host {
  return {
    read: (id) => files[id],
    resolve: (specifier, importer) => {
      if (!specifier.startsWith(".")) return
      const dir = importer.slice(0, importer.lastIndexOf("/"))
      const base = normalize(`${dir}/${specifier}`)
      for (const candidate of [base, `${base}.ts`, `${base}/index.ts`]) {
        if (files[candidate] !== undefined) return candidate
      }
    },
  }
}

export function compile(files: Record<string, string>, id: string): CompileResult {
  return new Compiler(memoryHost(files)).compile(files[id], id)
}

/**
 * Join source lines, so a long snippet stays readable here as it would read as
 * a file.
 */
export function lines(...parts: string[]): string {
  return parts.join("\n")
}

function normalize(path: string): string {
  const out: string[] = []
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue
    if (part === "..") out.pop()
    else out.push(part)
  }
  return out.join("/")
}
