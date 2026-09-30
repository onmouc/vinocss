#!/usr/bin/env node
import { Command } from "commander"
import { build, buildSelf, buildWorkspace } from "@/index"

async function main(): Promise<void> {
  const program = new Command()
    .name("vinocss-build")
    .description("build the library and binary entries of a VinoCSS package")
    .option("--lib <names>", "extra library entries, comma separated", collect, [])
    .option("--bin <names>", "extra binary entries, comma separated", collect, [])
    .option("--out <dir>", "output directory", "out")
    .option("--self", "build only this package, not its workspace dependencies")
    .option("--workspace [dir]", "build every package in the workspace in dependency order")
    .option("--force", "rebuild even when the cached checksum is fresh")
    .action(async (options: Options) => {
      const common = {
        cwd: process.cwd(),
        lib: options.lib,
        bin: options.bin,
        outDir: options.out,
        force: options.force,
      }
      if (options.workspace !== undefined && options.self) {
        console.warn("vinocss-build: --self and --workspace are mutually exclusive")
        process.exitCode = 1
        return
      }
      if (options.workspace !== undefined)
        await buildWorkspace({
          cwd: common.cwd,
          dir: typeof options.workspace === "string" ? options.workspace : undefined,
          force: options.force,
        })
      else if (options.self) await buildSelf(common)
      else await build(common)
    })

  await program.parseAsync()
}

type Options = {
  lib: string[]
  bin: string[]
  out: string
  self?: boolean
  workspace?: string | boolean
  force?: boolean
}

/**
 * Collect a comma-separated option across repeats.
 *
 * Commander calls it once per flag with the values seen so far,
 * so `--lib a,b --lib c` and `--lib a,b,c` both yield `[a, b, c]`.
 * A piece with only spaces is dropped, so a trailing comma or a blank entry is harmless.
 */
function collect(value: string, previous: string[]): string[] {
  return [
    ...previous,
    ...value
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
  ]
}

await main()
