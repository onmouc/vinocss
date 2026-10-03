import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { detectWorkspace } from "@vinocss/devtools-build/workspace"
import { isExcluded } from "@/exclude"
import type { WorkspacePackage } from "@vinocss/devtools-build/workspace"
import type { LicenseOptions, LicenseReporter, LicenseResult, PackageResult } from "@/types"

const licenseFile = "LICENSE"

/**
 * Sync the workspace root license into every child package.
 *
 * It detects the pnpm workspace from `cwd`, reads `LICENSE` at its root,
 * and copies that text into each child package.
 * A package that already matches is left untouched,
 * so a repeated run stays cheap and no file is rewritten.
 * An excluded package is skipped, and the result records which case applied.
 */
export function syncLicenses(options: LicenseOptions = {}): LicenseResult {
  const cwd = resolve(options.cwd ?? process.cwd())
  const report = options.report ?? {}
  const workspace = detectWorkspace(cwd)
  if (!workspace) {
    report.warn?.(`no pnpm workspace above ${cwd}`)
    return { packages: [] }
  }
  const source = join(workspace.root, licenseFile)
  if (!existsSync(source)) {
    report.warn?.(`no ${licenseFile} at the workspace root ${workspace.root}`)
    return { root: workspace.root, packages: [] }
  }
  const text = readFileSync(source, "utf8")
  const exclude = options.exclude ?? []
  const packages = workspace.packages.map((pkg) =>
    syncPackage(pkg, workspace.root, text, exclude, report),
  )
  return { root: workspace.root, source, packages }
}

function syncPackage(
  pkg: WorkspacePackage,
  root: string,
  text: string,
  exclude: string[],
  report: LicenseReporter,
): PackageResult {
  if (isExcluded(pkg, root, exclude)) {
    const result: PackageResult = { name: pkg.name, dir: pkg.dir, action: "excluded" }
    report.skip?.(result)
    return result
  }
  const target = join(pkg.dir, licenseFile)
  if (existsSync(target) && readFileSync(target, "utf8") === text) {
    const result: PackageResult = { name: pkg.name, dir: pkg.dir, action: "unchanged" }
    report.skip?.(result)
    return result
  }
  writeFileSync(target, text)
  const result: PackageResult = { name: pkg.name, dir: pkg.dir, action: "written" }
  report.write?.(result)
  return result
}
