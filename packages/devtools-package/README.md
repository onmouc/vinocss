# @vinocss/devtools-package

This package re-exports the node package abstraction that `@vinocss/devtools-build` reads.
The build reads a `package.json`, tells a directory that holds one, and walks up to a package root;
this package gives that read a home of its own for other packages to depend on.
The code still lives in `@vinocss/devtools-build`, and this package only exposes it,
so the build tool never depends back on this package and no dependency cycle forms.

## Surface

1. `readManifest(dir)` reads the `package.json` of a directory, or `undefined` when it is missing.
2. `isPackage(dir)` tells whether a directory itself holds a `package.json`.
3. `readPackage(dir)` reads a directory as a package, with its manifest and name.
4. `findPackageRoot(from)` walks up from a path to the nearest package root, itself included.
5. `dependencyNames(manifest)` lists every declared dependency name, across all four kinds.
6. `dependencyRanges(manifest)` merges the declared ranges, so a repeated name resolves predictably.
7. `Manifest` and `PackageInfo` are the shapes those reads return.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/devtools-package`.
2. Import the read you need from the package root.
3. Reach for [@vinocss/devtools-workspace](../devtools-workspace/README.md)
   when the task is a pnpm workspace instead.

```ts
import { findPackageRoot, readPackage } from "@vinocss/devtools-package"
```
