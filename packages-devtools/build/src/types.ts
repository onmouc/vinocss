import type { ExternalOption } from "rolldown"

export type BuildOptions = {
  cwd?: string
  outDir?: string
  tsconfig?: string
  lib?: string[]
  bin?: string[]
}

export type Context = {
  cwd: string
  outDir: string
  tsconfig: string
  external: ExternalOption
}

export type Entry = {
  name: string
  file: string
}
