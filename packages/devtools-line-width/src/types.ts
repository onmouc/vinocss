/**
 * A line that runs past the maximum width.
 *
 * `column` is the first character beyond the limit, so a reader lands on the overflow.
 */
export type Violation = {
  file: string
  line: number
  column: number
  length: number
}

/**
 * The callbacks a check calls as it runs.
 *
 * The library never prints, so a bin supplies the reporter and owns the console.
 */
export type Reporter = {
  violation?: (violation: Violation) => void
  warn?: (message: string) => void
}

/**
 * The input of a line width check.
 *
 * 1. `cwd` is the directory the file paths resolve from, and it defaults to the process directory.
 * 2. `max` is the longest allowed line, and it defaults to the shared default.
 * 3. `patterns` are git pathspecs that limit the files, and an empty list keeps every one.
 * 4. `ignore` are git pathspecs to exclude, such as a generated folder.
 * 5. `report` carries the callbacks, so a caller can watch the run.
 */
export type LineWidthOptions = {
  cwd?: string
  max?: number
  patterns?: string[]
  ignore?: string[]
  report?: Reporter
}
