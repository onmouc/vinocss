#!/usr/bin/env node
import chalk from "chalk"
import { Command } from "commander"
import { syncLicenses } from "@/index"
import type { LicenseReporter, PackageResult } from "@/index"

const prefix = "vinocss-license:"

function main(): void {
  const program = new Command()
    .name("vinocss-license")
    .description("sync the workspace root license into every published child package")
    .option("--exclude <names>", "comma separated packages to skip, repeatable", collect, [])
    .action((options: Options) => run(options))
  program.parse()
}

function run(options: Options): void {
  const report: LicenseReporter = {
    write: (result: PackageResult) => console.log(chalk.cyan(prefix), `synced ${result.name}`),
    skip: (result: PackageResult) => console.log(chalk.gray(prefix), chalk.gray(describe(result))),
    warn: (message: string) => console.warn(chalk.yellow(prefix), message),
  }
  const result = syncLicenses({ exclude: options.exclude, report })
  if (!result.source) {
    process.exitCode = 1
    return
  }
  const written = result.packages.filter((pkg) => pkg.action === "written").length
  console.log(chalk.green(prefix), `synced ${written} of ${result.packages.length} package(s)`)
}

function describe(result: PackageResult): string {
  const why = result.action === "unchanged" ? "already current" : result.action
  return `skipped ${result.name} (${why})`
}

type Options = {
  exclude: string[]
}

/**
 * Collect a comma-separated option across repeats.
 *
 * Commander calls it once per flag with the values seen so far,
 * so `--exclude a,b --exclude c` and `--exclude a,b,c` both yield `[a, b, c]`.
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

main()
