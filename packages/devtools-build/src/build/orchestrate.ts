import { resolve } from "node:path"
import { clearChecksum, isCached, saveChecksum } from "@/cache"
import { readScriptSources, readSources } from "@/cache/fingerprint"
import { buildBin, buildLib, clean } from "@/build/engine"
import { collect, createExternal } from "@/build/resolve"
import { runScript, sequence } from "@/build/run"
import { buildOrder, buildScript, dependencyOrder, detectWorkspace, packageAt } from "@/workspace"
import type { BuildOptions, Context, Reporter, WorkspaceOptions } from "@/types"
import type { WorkspacePackage } from "@/workspace"

const silent: Reporter = {}

/**
 * Build the library and binary entries of one package into its output directory.
 *
 * A library entry emits esm, cjs, and bundled declarations,
 * each minified and carrying a source map.
 * A binary entry emits esm only, and it keeps any shebang the source sets.
 * The build reuses the `@/*` alias from the app tsconfig,
 * and it leaves the declared dependencies external.
 *
 * By default it takes `src/index.ts` as a library entry and `src/main.ts` as a binary entry,
 * and it skips a default that the package does not have.
 * The `lib` and `bin` options add more entry names,
 * and `cwd`, `tsconfig`, and `outDir` point at another package, config, or output directory.
 *
 * The build reads a source fingerprint before it starts, and it skips the whole build
 * when the checksum file matches and the output directory is already there.
 * It clears the output directory first, keeps the directory itself,
 * and writes the fresh checksum once the entries land.
 * The `force` option ignores a fresh checksum and builds anyway.
 *
 * It returns whether it built, so a caller can tell a real build from a cache hit.
 */
export async function buildSelf(options: BuildOptions = {}): Promise<boolean> {
  const cwd = resolve(options.cwd ?? process.cwd())
  const outDir = resolve(cwd, options.outDir ?? "out")
  const report = options.report ?? silent
  const sources = readSources(cwd)
  if (!options.force && isCached(cwd, outDir, sources)) return false
  const context: Context = {
    cwd,
    outDir,
    tsconfig: resolve(cwd, options.tsconfig ?? "tsconfig.app.json"),
    external: createExternal(cwd),
    report,
  }
  const lib = collect(context, "index", options.lib ?? [])
  const bin = collect(context, "main", options.bin ?? [])
  if (lib.length === 0 && bin.length === 0) {
    report.warn?.("no entries found")
    return false
  }
  clearChecksum(cwd)
  clean(outDir)
  const jobs: Promise<void>[] = []
  if (lib.length > 0) jobs.push(buildLib(context, lib))
  if (bin.length > 0) jobs.push(buildBin(context, bin))
  await Promise.all(jobs)
  saveChecksum(cwd, outDir, sources)
  return true
}

/**
 * Build a package after building its workspace dependencies.
 *
 * It detects the pnpm workspace that holds the package,
 * lists every workspace dependency in build order, and builds each one that is stale.
 * Then it builds the package itself, so a dependency is always ready first.
 * A package outside a workspace, or a workspace without the package, just builds itself.
 *
 * The dependency builds run the package manager script of each dependency,
 * which keeps any extra `--lib` or `--bin` entries that a dependency declares.
 */
export async function build(options: BuildOptions = {}): Promise<void> {
  const cwd = resolve(options.cwd ?? process.cwd())
  const workspace = detectWorkspace(cwd)
  const self = workspace ? packageAt(workspace, cwd) : undefined
  if (!workspace || !self) {
    await buildSelf(options)
    return
  }
  const report = options.report ?? silent
  await sequence(dependencyOrder(workspace, self), (dep) =>
    buildDependency(dep, { force: options.force, report }),
  )
  if (!options.force && isCached(self.dir)) {
    report.skip?.(`skipped ${self.name} (unchanged)`)
    return
  }
  report.step?.(`building ${self.name}`)
  await buildSelf({ ...options, cwd: self.dir })
}

/**
 * Build every package in a pnpm workspace in dependency order.
 *
 * Each package builds after the workspace packages it needs.
 * It runs the package `build:self` script by default, so a package may use any build tool
 * behind that script, and the `script` option names another script to run.
 * A package without the script is skipped, so shared config packages pass through.
 * The build records the source and output checksum of every package it builds,
 * whatever tool the script runs, so a repeated build stays cheap.
 * A fresh package is skipped too, unless `force` asks for a rebuild.
 *
 * The `dir` option points at the workspace, and `cwd` defaults to the process directory.
 * Without a workspace it warns and returns, since there is no order to follow.
 */
export async function buildWorkspace(options: WorkspaceOptions = {}): Promise<void> {
  const cwd = resolve(options.cwd ?? process.cwd())
  const report = options.report ?? silent
  const workspace = detectWorkspace(options.dir ? resolve(options.dir) : cwd)
  if (!workspace) {
    report.warn?.("no pnpm workspace found")
    return
  }
  const steps = buildOrder(workspace).map((pkg) => ({
    pkg,
    script: buildScript(pkg, options.script),
  }))
  await sequence(steps, async ({ pkg, script }) => {
    if (!script) {
      report.skip?.(`skipped ${pkg.name} (no build script)`)
      return
    }
    await buildPackage(pkg, script, options)
  })
}

/**
 * Build one workspace package through its own script, and cache the result.
 *
 * The output directory defaults to `out`, and the `outDir` option points at another one.
 * A fresh checksum and a present output directory skip the script.
 * A forced build clears the record first, so the script runs even when it is fresh.
 * The checksum is read once, before the script runs, and written after it lands,
 * so the record covers the sources, the local files the script names, and the files it produced.
 */
async function buildPackage(
  pkg: WorkspacePackage,
  script: string,
  options: WorkspaceOptions,
): Promise<void> {
  const report = options.report ?? silent
  const outDir = resolve(pkg.dir, options.outDir ?? "out")
  const command = pkg.manifest.scripts?.[script] ?? ""
  const sources = { ...readSources(pkg.dir), ...readScriptSources(pkg.dir, command) }
  if (!options.force && isCached(pkg.dir, outDir, sources)) {
    report.skip?.(`skipped ${pkg.name} (unchanged)`)
    return
  }
  report.step?.(`building ${pkg.name}`)
  if (options.force) clearChecksum(pkg.dir)
  await runScript(pkg.dir, script)
  saveChecksum(pkg.dir, outDir, sources)
}

async function buildDependency(pkg: WorkspacePackage, options: WorkspaceOptions): Promise<void> {
  const report = options.report ?? silent
  const script = buildScript(pkg, options.script)
  if (!script) {
    report.skip?.(`skipped ${pkg.name} (no build script)`)
    return
  }
  await buildPackage(pkg, script, options)
}
