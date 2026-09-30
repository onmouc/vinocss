import { existsSync, readdirSync, rmSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { build as rolldown } from "rolldown"
import { dts } from "rolldown-plugin-dts"
import type { InputOptions, OutputOptions } from "rolldown"
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
      ...inputOptions(context),
      input,
      plugins: [dts({ tsconfig: context.tsconfig, sourcemap: true })],
      output: outputs(context, "esm"),
    }),
    rolldown({
      ...inputOptions(context),
      input,
      output: outputs(context, "cjs"),
    }),
  ])
}

export async function buildBin(context: Context, entries: Entry[]): Promise<void> {
  const input = Object.fromEntries(entries.map((entry) => [entry.name, entry.file]))
  await rolldown({
    ...inputOptions(context),
    input,
    platform: "node",
    output: outputs(context, "esm"),
  })
}

/**
 * Share the input options of every entry build, and forward rolldown's own logs.
 *
 * Rolldown prints a log to the console unless `onLog` intercepts it,
 * so the hook hands each one to the reporter and lets the bin decide how to print.
 * The interception is why the library stays silent even when rolldown has something to say.
 */
function inputOptions(context: Context): InputOptions {
  return {
    cwd: context.cwd,
    tsconfig: context.tsconfig,
    external: context.external,
    onLog(level, log) {
      context.report.log?.(level, log.message)
    },
  }
}

function outputs(context: Context, format: "esm" | "cjs"): OutputOptions {
  const extension = format === "cjs" ? ".cjs" : ".js"
  return {
    dir: context.outDir,
    format,
    entryFileNames: `[name]${extension}`,
    chunkFileNames: `chunks/[hash]${extension}`,
    assetFileNames: "assets/[hash].[ext]",
    minify: true,
    sourcemap: true,
  }
}
