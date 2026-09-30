import { resolve } from "node:path"
import { buildBin, buildLib, clean } from "@/build"
import { collect, createExternal } from "@/resolve"
import type { BuildOptions, Context } from "@/types"
export type { BuildOptions } from "@/types"

/**
 * Build the library and binary entries of a package into its output directory.
 *
 * A library entry emits esm, cjs, and bundled declarations, each minified and carrying a source map.
 * A binary entry emits esm only, and it keeps any shebang the source sets.
 * The build reuses the `@/*` alias from the app tsconfig, and it leaves the declared dependencies external.
 *
 * By default it takes `src/index.ts` as a library entry and `src/main.ts` as a binary entry,
 * and it skips a default that the package does not have.
 * The `lib` and `bin` options add more entry names,
 * and `cwd`, `tsconfig`, and `outDir` point at another package, config, or output directory.
 * The build clears the output directory first, but it keeps the directory itself.
 */
export async function build(options: BuildOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const context: Context = {
    cwd,
    outDir: resolve(cwd, options.outDir ?? "out"),
    tsconfig: resolve(cwd, options.tsconfig ?? "tsconfig.app.json"),
    external: createExternal(cwd),
  }
  const lib = collect(context, "index", options.lib ?? [])
  const bin = collect(context, "main", options.bin ?? [])
  if (lib.length === 0 && bin.length === 0) {
    console.warn("vinocss-build: no entries found")
    return
  }
  clean(context.outDir)
  const jobs: Promise<void>[] = []
  if (lib.length > 0) jobs.push(buildLib(context, lib))
  if (bin.length > 0) jobs.push(buildBin(context, bin))
  await Promise.all(jobs)
}
