# @vinocss/devtools-license

This package syncs the workspace root `LICENSE` into every published child package.
A published package should carry the license it ships under,
so this tool copies the one root file and every published package states the same MIT terms.
A private package is skipped, since the root license already covers the repo,
and the tool never removes a license it did not write.
It ships as the `vinocss-license` command, and it is published so any project can reuse it.

## Scope

1. By default it covers every published child package the pnpm workspace declares.
2. It reads the workspace from `pnpm-workspace.yaml`, and only the pnpm layout is supported.
3. It reads the source from `LICENSE` at the workspace root.
4. It skips a private package, since the root license already covers it.
5. A package that already matches the source is left untouched, so a repeat run is safe.
6. A missing workspace or a missing root `LICENSE` is a warning, and the command fails.

## Exclude

1. `--exclude` names packages to skip, and it takes a comma list and repeats.
2. A selector matches the full package name, such as `@vinocss/devtools-license`.
3. It also matches the name without its scope, such as `devtools-license`, whatever that scope is.
4. It also matches the path from the workspace root, such as `packages/devtools-license`.

## Output

1. The library returns the result per package and calls a `report` callback for each.
2. The command lists every synced and skipped package, then a summary line.
3. A clean run exits with a zero code, and a missing source exits with a failing one.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/devtools-license`.
2. Run `vinocss-license` to sync every published child package.
3. Pass `--exclude` to skip a package that should not carry the license.

```text
vinocss-license --exclude devtools-example
vinocss-license: synced @vinocss/devtools-build
vinocss-license: skipped @vinocss/devtools-example (excluded)
vinocss-license: synced 1 of 2 package(s)
```
