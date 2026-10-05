#!/usr/bin/env node
import { Command } from "commander"
import { Logger } from "@vinocss/utils-log"
import { checkLineWidth, defaultMax } from "@/index"
import type { Violation } from "@/index"

const log = new Logger({ name: "vinocss-max-len" })

function main(): void {
  const program = new Command()
    .name("vinocss-max-len")
    .description("report every tracked line that runs past the maximum width")
    .argument("[patterns...]", "git pathspecs that limit the files, default every tracked file")
    .option("-m, --max <columns>", "longest allowed line, in characters", String(defaultMax))
    .option("--ignore <patterns>", "comma separated pathspecs to skip, repeatable", collect, [])
    .action((patterns: string[], options: Options) => run(patterns, options))
  program.parse()
}

function run(patterns: string[], options: Options): void {
  const max = Number(options.max)
  if (!Number.isInteger(max) || max < 1) {
    log.warn(`invalid --max ${options.max}`)
    process.exitCode = 1
    return
  }
  const report = { violation: (violation: Violation) => log.error(format(violation, max)) }
  const selected = { patterns, ignore: options.ignore, max, report }
  const violations = checkLineWidth(selected)
  if (violations.length > 0) {
    log.warn(`${violations.length} line(s) over ${max}`)
    process.exitCode = 1
    return
  }
  log.done(`every line fits ${max} characters`)
}

function format(violation: Violation, max: number): string {
  const place = `${violation.file}:${violation.line}:${violation.column}`
  return `${place} line is ${violation.length}, over ${max}`
}

type Options = {
  max: string
  ignore: string[]
}

/**
 * Collect a comma-separated option across repeats.
 *
 * Commander calls it once per flag with the values seen so far,
 * so `--ignore a,b --ignore c` and `--ignore a,b,c` both yield `[a, b, c]`.
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
