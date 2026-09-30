# @vinocss/devtools-build

This package wraps the rolldown build for VinoCSS packages behind one command.
Instead of repeating a `rolldown.config.ts` in every package,
each package runs `vinocss-build` and lets this tool supply the config.
It is published for anyone to use, so any project can follow the same recipe.

## Entries

1. By default it builds `src/index.ts` as a library entry, and `src/main.ts` as a binary entry.
2. A missing entry is skipped, so a package can ship only one of the two.
3. `--lib foo,bar` adds `src/foo.ts` and `src/bar.ts` as more library entries.
4. `--bin foo,bar` adds `src/foo.ts` and `src/bar.ts` as more binary entries.
5. The flags add to the defaults; they do not replace them.

A library entry emits esm, cjs, and bundled declarations, each with a source map.
A binary entry emits esm only, and keeps any shebang the source sets.
Both are minified, and a package points its `exports` and `bin` at the output files.

## Output

1. Every file lands in `out`, or in the directory `--out` names.
2. A build clears that directory first, and keeps the directory itself.
3. A missing directory is created on write, and a non-directory path is an error.

## Alias

The tool reads `tsconfig.app.json` and reuses the `paths` aliases it declares,
so an import such as `@/util` resolves during the build without an extra plugin.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/devtools-build`.
2. Point the package `build` script at `vinocss-build`.
3. Pass `--lib`, `--bin`, or `--out` to change the defaults.
4. Run `pnpm build` from the package, or let the workspace recursive build call it.

```json
{
  "scripts": {
    "build": "vinocss-build --lib theme"
  }
}
```

The package also exports `build`, so a script can call the same logic directly,
which is how this package builds itself before the `vinocss-build` command exists.
