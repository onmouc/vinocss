# Workspace

The map of every package in this workspace, and the reason to read it before writing code.
VinoCSS is one framework split across small packages,
so a feature often belongs in a package that already exists.
Before you build a helper, a read, or a config, check this list for one you can reuse.

## Framework

1. `vinocss` (`packages/vinocss`) is the entry an app imports.
2. Its root entry holds the `var$`, `class$`, and `style$` placeholders.
3. Its `vinocss/utils` subpath holds the css value helpers such as `px` and `v`.

The runes and the helpers ship from the one package,
so an app installs `vinocss` once and imports each piece from it.

## Devtools

1. `@vinocss/devtools-build` wraps the rolldown build behind the `vinocss-build` command,
   and exposes the node package and pnpm workspace reads as subpath exports.
2. `@vinocss/devtools-tsconfig` holds the shared TypeScript config variants.
3. `@vinocss/devtools-max-len` reports any tracked line over the width limit.
4. `@vinocss/devtools-license` syncs the root `LICENSE` into every child package.
5. `@vinocss/devtools-lines` joins source parts into one string, one part per line.

A tool takes a `devtools-*` name and lives under `packages/`.
The build exposes the package and workspace reads,
so a new tool can import a read instead of writing its own.

## Examples

`@vinocss/example-*` (`packages/example-*`) are small private apps,
one per framework and language: React, Solid, Svelte, and Vue, each in JavaScript and TypeScript.
They show how the `var$`, `class$`, and `style$` calls are written,
and they are read for that shape rather than run, since the compiler is not built yet.

## Reuse

1. Search this map for a package that already covers the feature you want.
2. Reuse an exported read or helper before you write a second copy of it.
3. Put a shared helper in a `devtools-*` package once a second package needs it.
4. Extend the package that owns a concern instead of adding a near-duplicate.
5. Add a package only when no existing one owns the concern, and say why in the change.

Each package README explains its own surface, and the nearest test shows the intended use.
Read one before you design a new surface, so the feature fits the package you extend.
