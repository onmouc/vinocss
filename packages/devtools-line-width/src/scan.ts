import type { Violation } from "@/types"

/**
 * Find every line of a text that runs past the maximum width.
 *
 * A line is measured in code points, so a character outside the basic plane counts once.
 * A carriage return is stripped with its newline, so a CRLF file measures like an LF one.
 * A violation points at column `max + 1`, the first character past the limit.
 */
export function scanText(file: string, text: string, max: number): Violation[] {
  const violations: Violation[] = []
  const lines = text.split(/\r?\n/u)
  for (let index = 0; index < lines.length; index++) {
    const length = [...lines[index]].length
    if (length > max) violations.push({ file, line: index + 1, column: max + 1, length })
  }
  return violations
}
