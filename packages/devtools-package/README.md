# @vinocss/devtools-package

This package reads a node package from disk and walks up to its root.
A tool often needs the manifest of a package, its dependency names,
or the nearest `package.json` above a path, and the reads are small but easy to repeat,
so one package owns them.
It is published for anyone to use, so a project can read a package the same way.

## Surface

1. `readManifest(dir)` parses `package.json` and returns a `Manifest`, or `undefined`.
2. `readPackage(dir)` adds the directory and the name, and returns a `PackageInfo`.
3. `isPackage(dir)` tells whether a directory holds a manifest.
4. `findPackageRoot(from)` walks up to the nearest ancestor that holds a manifest.
5. `dependencyNames(manifest)` lists the names across all four dependency kinds.
6. `dependencyRanges(manifest)` merges the ranges, and a later kind wins for a shared name.

## Manifest

1. `name`, `version`, `private`, `type`, `scripts`, and `files` stay typed.
2. The dependency fields are `dependencies`, `devDependencies`, `peerDependencies`,
   and `optionalDependencies`.
3. An unknown field stays readable through the index signature.

## Throws

- `readManifest` throws when a present manifest holds malformed JSON.

## Usage

1. Install it as a dependency, for example `pnpm add @vinocss/devtools-package`.
2. Read the manifest of a directory, then ask it for the dependency names.

```ts
import { readManifest, dependencyNames } from "@vinocss/devtools-package"

const manifest = readManifest(process.cwd())
const names = manifest ? dependencyNames(manifest) : []
```

The reads live in [`@vinocss/devtools-build`](../devtools-build/README.md),
and this package builds them in, so a caller reaches them from one small name
without the build engine on the runtime graph; the
[re-export guide](../../docs/contributing/reexport.md) states the rule.
