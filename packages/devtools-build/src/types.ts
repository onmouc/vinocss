import type { ExternalOption } from "rolldown"

export type BuildOptions = {
  cwd?: string
  outDir?: string
  tsconfig?: string
  lib?: string[]
  bin?: string[]
  force?: boolean
  report?: Reporter
}

export type WorkspaceOptions = {
  cwd?: string
  dir?: string
  outDir?: string
  script?: string
  force?: boolean
  report?: Reporter
}

export type Context = {
  cwd: string
  outDir: string
  tsconfig: string
  external: ExternalOption
  report: Reporter
}

export type LogLevel = "info" | "debug" | "warn"

export type Reporter = {
  step?(message: string): void
  skip?(message: string): void
  log?(level: LogLevel, message: string): void
  warn?(message: string): void
}

export type Entry = {
  name: string
  file: string
}
