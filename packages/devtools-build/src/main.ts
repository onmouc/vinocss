#!/usr/bin/env node
import { Command } from "commander"
import { build, buildSelf, buildWorkspace } from "@/index"
import { Logger } from "@/log"
import type { Reporter } from "@/index"

const log = new Logger({ name: "vinocss-build" })
const rolldown = new Logger({ name: "rolldown" })

async function main(): Promise<void> {
  const report: Reporter = {
    step: (message) => log.info(message),
    skip: (message) => log.debug(message),
    log: (level, message) => {
      if (level === "warn") rolldown.warn(message)
      else if (level === "debug") rolldown.debug(message)
      else rolldown.info(message)
    },
    warn: (message) => log.warn(message),
  }
  const program = new Command()
    .name("vinocss-build")
    .description("build the library and binary entries of a VinoCSS package")
    .option("-l, --lib <names>", "extra library entries, comma separated", collect, [])
    .option("-b, --bin <names>", "extra binary entries, comma separated", collect, [])
    .option("--out <dir>", "output directory", "out")
    .option("-s, --script <name>", "package script the workspace build runs", "build:self")
    .option("-S, --self", "build only this package, not its workspace dependencies")
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
