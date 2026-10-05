import { closeSync, openSync, writeSync } from "node:fs"
import { paintDim, paintLevel } from "@/log/level"
import { formatTime, resolveTimeFormat } from "@/log/time"
import type { LogLevel, LogSink, LoggerOptions, TimeFormat } from "@/log/types"

/**
 * Write a formatted line and remember when it was written.
 *
 * A logger owns the fields every line carries, so each level method renders
 * the same shape: an optional name, an optional timestamp, a colored level
 * marker, the message, and the milliseconds since the previous call.
 * The level choices are `debug`, `info`, `done`, `warn`, and `error`,
 * and each one has its own marker and color.
 *
 * The sink defaults to the standard output, and `file` or `sink` sends the
 * lines elsewhere. A detail that a call passes lands dim on the next line.
 * Color defaults on for the terminal and off once the sink is a file.
 */
export class Logger {
  /** The name that prefixes every line, empty when no name is set. */
  readonly name: string

  private readonly format: TimeFormat | undefined
  private readonly color: boolean
  private readonly showLevel: boolean
  private readonly showDelta: boolean
  private readonly sink: LogSink
  private readonly release: () => void
  private readonly now: () => number
  private last: number | undefined

  constructor(options: LoggerOptions = {}) {
    this.name = options.name ?? ""
    this.format = resolveTimeFormat(options.time)
    this.color = options.color ?? options.file === undefined
    this.showLevel = options.level ?? true
    this.showDelta = options.delta ?? false
    if (options.sink === undefined) {
      const target = createSink(options.file)
      this.sink = target.write
      this.release = target.close
    } else {
      this.sink = options.sink
      this.release = () => {}
    }
    this.now = options.now ?? Date.now
  }

  /**
   * Release a file sink.
   *
   * The process closes the descriptor on exit, so a command may skip this,
   * and a caller that must remove or replace the file calls it to let go first.
   */
  close(): void {
    this.release()
  }

  /** Write a `debug` line, the quietest level. */
  debug(message: string, details?: string): void {
    this.write("debug", message, details)
  }

  /** Write an `info` line, for a usual message. */
  info(message: string, details?: string): void {
    this.write("info", message, details)
  }

  /** Write a `done` line, for a task that finished well. */
  done(message: string, details?: string): void {
    this.write("done", message, details)
  }

  /** Write a `warn` line, for a problem that is not fatal. */
  warn(message: string, details?: string): void {
    this.write("warn", message, details)
  }

  /** Write an `error` line, the loudest level. */
  error(message: string, details?: string): void {
    this.write("error", message, details)
  }

  /** Milliseconds since the previous call, or `undefined` before the first. */
  get elapsed(): number | undefined {
    if (this.last === undefined) return undefined
    return this.now() - this.last
  }

  private write(level: LogLevel, message: string, details?: string): void {
    const now = this.now()
    const delta = this.showDelta && this.last !== undefined ? now - this.last : undefined
    this.last = now
    const parts: string[] = []
    if (this.name !== "") parts.push(this.name)
    if (this.showLevel) parts.push(paintLevel(level, this.color))
    if (this.format !== undefined) parts.push(formatTime(new Date(now), this.format))
    parts.push(message)
    if (delta !== undefined) parts.push(paintDim(`+${delta}ms`, this.color))
    const extra = details !== undefined && details !== "" ? `\n${this.detail(details)}` : ""
    this.sink(`${parts.join(" ")}${extra}`)
  }

  private detail(details: string): string {
    const indented = details
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n")
    return paintDim(indented, this.color)
  }
}

/** The shared logger a caller reaches without building one. */
export const log = new Logger()

function createSink(file: string | undefined): { write: LogSink; close: () => void } {
  if (file === undefined)
    return { write: (line) => process.stdout.write(`${line}\n`), close: () => {} }
  let fd: number | undefined
  return {
    write: (line) => {
      fd ??= openSync(file, "a")
      writeSync(fd, `${line}\n`)
    },
    close: () => {
      if (fd !== undefined) closeSync(fd)
      fd = undefined
    },
  }
}
