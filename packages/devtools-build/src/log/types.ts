/**
 * The severity a log call carries.
 *
 * The levels run from `debug`, the quietest, to `error`, the loudest,
 * and `done` marks a task that finished well.
 */
export type LogLevel = "debug" | "info" | "done" | "warn" | "error"

/**
 * The parts of a timestamp a logger may include.
 *
 * Each part is enabled on its own, so a caller keeps only the pieces a reader
 * needs. `time` switches the clock on and writes `hh:mm`, then `second` and
 * `millis` extend it to `hh:mm:ss` and `hh:mm:ss.mmm`. The full form is
 * `2013.04.15(6) 12:34:05.678`.
 */
export type TimeFormat = {
  /** The four-digit year, as `2013`. */
  year?: boolean
  /** The month and the day, as `04.15`. */
  monthDate?: boolean
  /** The weekday number in `0..6`, as `(6)`. */
  weekday?: boolean
  /** The clock, as `12:34`. */
  time?: boolean
  /** The seconds, as `:05`. */
  second?: boolean
  /** The milliseconds, as `.678`. */
  millis?: boolean
}

/**
 * Write one rendered line.
 *
 * The line carries no trailing newline, so the sink adds one.
 */
export type LogSink = (line: string) => void

/**
 * The settings a `Logger` takes.
 *
 * 1. `name` prefixes the line, and empty means no name is logged.
 * 2. `color` wraps the level marker in ansi codes, on for a terminal and off for a file.
 * 3. `time` enables a timestamp, either the full form or a `TimeFormat` of parts.
 * 4. `delta` appends the milliseconds since the previous call.
 * 5. `level` shows the level marker, and defaults to on.
 * 6. `file` appends the lines to a file instead of the standard output.
 * 7. `sink` takes a custom writer, and it wins over `file`.
 * 8. `now` reads the clock, so a test can fix the time.
 */
export type LoggerOptions = {
  name?: string
  color?: boolean
  time?: boolean | TimeFormat
  delta?: boolean
  level?: boolean
  file?: string
  sink?: LogSink
  now?: () => number
}
