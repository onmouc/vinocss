/**
 * Join source parts into one string, one part per line.
 *
 * A multi-line snippet then reads in source as the file would read,
 * so a fixture or an expected output stays legible without escapes.
 */
export function lines(...parts: string[]): string {
  return parts.join("\n")
}
