import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { listFiles } from "@/files"
import { scanText } from "@/scan"
import type { LineWidthOptions, Reporter, Violation } from "@/types"

/**
 * The longest line a check allows when a caller passes no `max`.
 */
export const defaultMax = 100

/**
 * Check every selected file for a line that runs past the maximum width.
 *
 * By default it checks every git tracked file and every uncommitted file git does not ignore,
 * except a lockfile, and `patterns` or `ignore` change that set.
 * A binary file is skipped, so a tracked image does not read as one endless line.
 * The library is silent: it collects the violations, calls `report` for each,
 * and returns the same list so a caller can act on it.
 */
export function checkLineWidth(options: LineWidthOptions = {}): Violation[] {
  const cwd = resolve(options.cwd ?? process.cwd())
  const max = options.max ?? defaultMax
  const patterns = options.patterns ?? []
  const ignore = options.ignore ?? []
  const files = listFiles(cwd, patterns, ignore)
  const violations: Violation[] = []
  for (const file of files) {
    const text = readText(resolve(cwd, file))
    if (text === undefined) continue
    violations.push(...scanText(file, text, max))
  }
  const report: Reporter = options.report ?? {}
  for (const violation of violations) report.violation?.(violation)
  return violations
}

function readText(file: string): string | undefined {
  const buffer = readFileSync(file)
  return buffer.includes(0) ? undefined : buffer.toString("utf8")
}
