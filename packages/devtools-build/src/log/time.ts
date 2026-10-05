import type { TimeFormat } from "@/log/types"

/** Every time part turned on, so a caller overrides only the parts to drop. */
export const fullTimeFormat: Required<TimeFormat> = {
  year: true,
  monthDate: true,
  weekday: true,
  time: true,
  second: true,
  millis: true,
}

/**
 * Resolve the `time` option into the parts to render.
 *
 * `false` and `undefined` turn the timestamp off, `true` takes every part,
 * and a `TimeFormat` overrides the full form one part at a time.
 */
export function resolveTimeFormat(value?: boolean | TimeFormat): TimeFormat | undefined {
  if (value === undefined || value === false) return undefined
  if (value === true) return fullTimeFormat
  return { ...fullTimeFormat, ...value }
}

/**
 * Format a date into the enabled parts.
 *
 * The date and the clock join with a space, and each missing part is dropped,
 * so the full form is `2013.04.15(6) 12:34:05.678`.
 */
export function formatTime(date: Date, format: TimeFormat): string {
  const parts = [formatDate(date, format), formatClock(date, format)].filter(Boolean)
  return parts.join(" ")
}

function formatDate(date: Date, format: TimeFormat): string {
  const segments: string[] = []
  if (format.year) segments.push(pad(date.getFullYear(), 4))
  if (format.monthDate) segments.push(`${pad(date.getMonth() + 1, 2)}.${pad(date.getDate(), 2)}`)
  let text = segments.join(".")
  if (format.weekday) text += `(${date.getDay()})`
  return text
}

function formatClock(date: Date, format: TimeFormat): string {
  if (!format.time) return ""
  let text = `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}`
  if (format.second || format.millis) text += `:${pad(date.getSeconds(), 2)}`
  if (format.millis) text += `.${pad(date.getMilliseconds(), 3)}`
  return text
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0")
}
