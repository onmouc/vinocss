# @vinocss/devtools-workspace

This package re-exports the pnpm workspace abstraction that `@vinocss/devtools-build` reads.
The build detects the workspace, lists its packages, and orders them for a build;
this package gives that read a home of its own for other packages to depend on.
The code still lives in `@vinocss/devtools-build`, and this package only exposes it,
so the build tool never depends back on this package and no dependency cycle forms.

## Order

1. By default the build builds a package after the workspace packages it depends on.
2. It reads the workspace from `pnpm-workspace.yaml`, and only the pnpm layout is supported.
3. It follows every dependency kind, so a build tool kept as a dev dependency is built first.
4. It builds a dependency by running that package's `build:self` script,
   which keeps any extra `--lib` or `--bin` entries the dependency declares.
5. `--self` builds only this package, and it skips the workspace dependencies.
6. `--workspace [dir]` builds every package in the workspace in dependency order.
7. A dependency cycle is an error, since no build order exists for it.

## Surface

1. `detectWorkspace(from)` finds the workspace that holds a path, or `undefined` outside one.
2. `findWorkspaceRoot(from)` and `readWorkspaceGlobs(root)` read `pnpm-workspace.yaml`.
3. `globToRegExp(glob)` and `toPosix(path)` match a directory against a workspace glob.
4. `packageAt(workspace, dir)` finds the workspace package that owns a directory.
5. `workspaceDependencies(pkg, workspace)` lists the workspace packages a package depends on.
6. `dependencyOrder(workspace, target)` lists the packages one package needs, in build order.
7. `buildOrder(workspace)` lists every package in dependency order.
8. `buildScript(pkg)` picks the script that builds a package on its own.
9. `Workspace` and `WorkspacePackage` are the shapes those reads return.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/devtools-workspace`.
2. Detect the workspace, then ask it for a package, its dependencies, or the build order.
3. Reach for [@vinocss/devtools-package](../devtools-package/README.md)
   when the task is one node package instead.

```ts
import { buildOrder, detectWorkspace } from "@vinocss/devtools-workspace"
```
