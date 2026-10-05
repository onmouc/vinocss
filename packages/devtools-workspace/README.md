# @vinocss/devtools-workspace

This package detects a pnpm workspace and orders its packages for a build.
A tool that builds several packages needs the workspace layout, its globs,
and a dependency order, and the pnpm file format is narrow but easy to misread,
so one package owns the reads.
It is published for anyone to use, so a project can read a pnpm workspace the same way.

## Surface

1. `detectWorkspace(from)` finds the workspace above a path, or returns `undefined`.
2. `Workspace` holds the `root`, the `packages`, and a `byName` map.
3. `WorkspacePackage` is a package with the name it must have.
4. `findWorkspaceRoot(from)` and `workspaceGlobs(from)` read the root and its globs.
5. `globToRegExp(glob)` and `toPosix(path)` back the glob match.
6. `packageAt`, `workspaceDependencies`, `dependencyOrder`, and `buildOrder` order the packages.
7. `buildScript(pkg, name)` picks the script a package builds itself with.

## Layout

1. The workspace root is the nearest ancestor that holds `pnpm-workspace.yaml`.
2. Only the pnpm file is read; the `workspace` field of a root manifest is ignored.
3. The `packages` globs select the child directories that hold a manifest.

## Order

1. A dependency of any kind comes before the package that declares it.
2. Independent packages follow the name order, so a build stays deterministic.
3. A cycle throws, since no build order exists for it.

## Throws

- `dependencyOrder` and `buildOrder` throw on a dependency cycle.
- `globToRegExp` throws on a glob over 256 characters, or with more than 8 wildcards.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/devtools-workspace`.
2. Detect the workspace, then read the order its packages build in.

```ts
import { detectWorkspace, buildOrder } from "@vinocss/devtools-workspace"

const workspace = detectWorkspace(process.cwd())
const order = workspace ? buildOrder(workspace) : []
```

The reads live in [`@vinocss/devtools-build`](../devtools-build/README.md),
and this package builds them in, so a caller reaches them from one small name
without the build engine on the runtime graph; the
[re-export guide](../../docs/contributing/reexport.md) states the rule.
