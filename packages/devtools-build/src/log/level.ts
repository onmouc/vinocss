import { decorate } from "@/terminal"
import type { LogLevel } from "@/log/types"

const levelPaints = {
  dim: (text: string) => decorate(text).dim().toString(),
  blue: (text: string) => decorate(text).blue().toString(),
  green: (text: string) => decorate(text).green().toString(),
  yellow: (text: string) => decorate(text).yellow().toString(),
  red: (text: string) => decorate(text).red().toString(),
} as const

type Paint = keyof typeof levelPaints

/** The paint each level marker takes. */
const levelPaint: Record<LogLevel, Paint> = {
  debug: "dim",
  info: "blue",
  done: "green",
  warn: "yellow",
  error: "red",
}

/** The marker each level shows before the message. */
export const levelMarkers: Record<LogLevel, string> = {
  debug: "[>]",
  info: "[i]",
  done: "[v]",
  warn: "[!]",
  error: "[x]",
}

/** Render a level marker, painted unless color is off. */
export function paintLevel(level: LogLevel, color: boolean): string {
  return paint(levelMarkers[level], levelPaint[level], color)
}

/** Render a dim text, such as a detail line or a time cost. */
export function paintDim(text: string, color: boolean): string {
  return paint(text, "dim", color)
}

function paint(text: string, name: Paint, color: boolean): string {
  return color ? levelPaints[name](text) : text
}
