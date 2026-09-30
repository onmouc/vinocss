import { existsSync, readdirSync, rmSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { build as rolldown } from "rolldown"
import { dts } from "rolldown-plugin-dts"
import type { OutputOptions } from "rolldown"
import type { Context, Entry } from "@/types"

/**
 * Remove the contents of the output directory, and keep the directory itself.
 *
 * 1. A missing directory draws no action, so the build creates it later.
 * 2. An existing directory keeps its own path, while every entry inside goes.
 * 3. A hidden entry goes too, and a nested folder goes with its contents.
 * 4. A path that is not a directory throws, since a file has no contents to clear.
 */
export function clean(dir: string): void {
  if (!existsSync(dir)) return
  if (!statSync(dir).isDirectory()) throw new Error(`vinocss-build: ${dir} is not a directory`)
  for (const name of readdirSync(dir)) rmSync(resolve(dir, name), { recursive: true, force: true })
}

export async function buildLib(context: Context, entries: Entry[]): Promise<void> {
  const input = Object.fromEntries(entries.map((entry) => [entry.name, entry.file]))
  await Promise.all([
    rolldown({
      cwd: context.cwd,
      input,
      tsconfig: context.tsconfig,
      external: context.external,
      plugins: [dts({ tsconfig: context.tsconfig, sourcemap: true })],
      output: outputs(context, "esm"),
    }),
    rolldown({
      cwd: context.cwd,
      input,
      tsconfig: context.tsconfig,
      external: context.external,
      output: outputs(context, "cjs"),
    }),
  ])
}

export async function buildBin(context: Context, entries: Entry[]): Promise<void> {
  const input = Object.fromEntries(entries.map((entry) => [entry.name, entry.file]))
  await rolldown({
    cwd: context.cwd,
    input,
    tsconfig: context.tsconfig,
    external: context.external,
    platform: "node",
    output: outputs(context, "esm"),
  })
}

function outputs(context: Context, format: "esm" | "cjs"): OutputOptions {
  return {
    dir: context.outDir,
    format,
    entryFileNames: format === "cjs" ? "[name].cjs" : "[name].js",
    minify: true,
    sourcemap: true,
  }
}
