/**
 * What a sync did to one child package.
 *
 * `written` means the license was copied from the workspace root,
 * `unchanged` means the package already matched it,
 * `private` means the package is private and never published,
 * and `excluded` means a selector skipped the package.
 */
export type PackageAction = "written" | "unchanged" | "private" | "excluded"

/**
 * One child package the sync considered, with the action it took.
 */
export type PackageResult = {
  name: string
  dir: string
  action: PackageAction
}

/**
 * The outcome of a license sync.
 *
 * `root` and `source` stay undefined when no workspace or no root license was found,
 * so a caller can tell a real failure from a clean run.
 */
export type LicenseResult = {
  root?: string
  source?: string
  packages: PackageResult[]
}

/**
 * The callbacks a sync calls as it runs.
 *
 * The library never prints, so a bin supplies the reporter and owns the console.
 */
export type LicenseReporter = {
  write?: (result: PackageResult) => void
  skip?: (result: PackageResult) => void
  warn?: (message: string) => void
}

/**
 * The input of a license sync.
 *
 * 1. `cwd` is the directory the workspace is detected from, and defaults to the process directory.
 * 2. `exclude` holds the selectors that skip a child package, and an empty list keeps every one.
 * 3. `report` carries the callbacks, so a caller can watch the run.
 */
export type LicenseOptions = {
  cwd?: string
  exclude?: string[]
  report?: LicenseReporter
}
