#!/usr/bin/env node
import chalk from "chalk"
import { Command } from "commander"
import { build, buildSelf, buildWorkspace } from "@/index"
import type { Reporter } from "@/index"

async function main(): Promise<void> {
  const report: Reporter = {
    step: (message) => console.log(chalk.cyan("vinocss-build:"), message),
    skip: (message) => console.log(chalk.gray("vinocss-build:"), chalk.gray(message)),
    log: (level, message) => {
      const paint = level === "warn" ? chalk.yellow : level === "debug" ? chalk.gray : chalk.blue
      if (level === "warn") console.warn(paint("rolldown:"), message)
      else console.log(paint("rolldown:"), message)
    },
    warn: (message) => console.warn(chalk.yellow("vinocss-build:"), message),
  }
  const program = new Command()
    .name("vinocss-build")
    .description("build the library and binary entries of a VinoCSS package")
    .option("-l, --lib <names>", "extra library entries, comma separated", collect, [])
    .option("-b, --bin <names>", "extra binary entries, comma separated", collect, [])
    .option("--out <dir>", "output directory", "out")
    .option("-s, --script <name>", "package script the workspace build runs", "build:self")
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
        report,
      }
      if (options.workspace !== undefined && options.self) {
        report.warn?.("--self and --workspace are mutually exclusive")
        process.exitCode = 1
        return
      }
      if (options.workspace !== undefined)
        await buildWorkspace({
          cwd: common.cwd,
          dir: typeof options.workspace === "string" ? options.workspace : undefined,
          outDir: options.out,
          script: options.script,
          force: options.force,
          report,
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
  script: string
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
