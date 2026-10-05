# @vinocss/devtools-build

This package wraps the rolldown build for packages behind one command.
Instead of repeating a `rolldown.config.ts` in every package,
each package runs `vinocss-build` and lets this tool supply the config.
It is published for anyone to use, so any project can follow the same recipe.

## Entries

1. By default it builds `src/index.ts` as a library entry, and `src/main.ts` as a binary entry.
2. A missing entry is skipped, so a package can ship only one of the two.
3. `-l, --lib foo,bar` adds `src/foo.ts` and `src/bar.ts` as more library entries.
4. `-b, --bin foo,bar` adds `src/foo.ts` and `src/bar.ts` as more binary entries.
5. The flags add to the defaults; they do not replace them.

A library entry emits esm, cjs, and bundled declarations, each with a source map.
A binary entry emits esm only, and keeps any shebang the source sets.
Both are minified, and a package points its `exports` and `bin` at the output files.

## Cache

1. Before a build it reads every source file and output file,
   and hashes their paths and modified times.
2. The sources are `src`, `bin`, `package.json`, `jsconfig.json`, `index.html`,
   any root `tsconfig*.json`, any root `<tool>.config.*` such as `vite.config.ts`,
   and any local file the package script names, such as `build.mjs`.
3. The output files are everything already in the output directory.
4. Test files and test-runner configs are skipped in the source,
   since a test cannot change a build.
5. It writes the checksum to `node_modules/vinocss-build-checksum` after a build lands.
6. The next build skips when the checksum matches and the output directory exists.
7. `--force` ignores a fresh checksum, and a forced workspace build clears each record.

A workspace build records the checksum around the package `build:self` script,
so a package that runs another build tool, such as `vite` or `rslib`, still skips when it is fresh.

The checksum keys on the file set, so an added or removed file counts as a change.
Because the output files are in the key,
a build file changed or deleted by hand triggers a rebuild that restores it.
A change to a dependency does not invalidate a dependent,
since the build leaves dependencies external and the dependent output does not move.

## Output

1. Every file lands in `out`, or in the directory `--out` names.
2. A build clears that directory first, and keeps the directory itself.
3. A missing directory is created on write, and a non-directory path is an error.
4. A shared chunk lands in `chunks` with a content hash, and an asset lands in `assets` with one.

## Report

1. The library prints nothing, so each build takes a `report` with the callbacks it needs.
2. `step` and `skip` cover a built and a skipped package, so the log shows both and the reason.
3. `log` carries rolldown's own messages, which the build reads through its `onLog` option.
4. `warn` carries a problem the build found, such as a missing entry or workspace.
5. The `vinocss-build` command supplies a reporter backed by the logger,
   so the log carries a level and a color and lives in the bin.
6. Pass a reporter to capture the messages, or leave it out for a silent build.

## Alias

The tool reads `tsconfig.app.json` and reuses the `paths` aliases it declares,
so an import such as `@/util` resolves during the build without an extra plugin.

## Exports

1. The root export is `build`, the ordered build, plus `buildSelf` and `buildWorkspace`.
2. The `./package`, `./workspace`, `./log`, and `./terminal` subpaths back the re-export
   packages below, so a caller reaches a read through one small name.

## Re-exports

Several packages ship a read that lives here.
The build tool starts from its own source before any workspace package has built output,
so a workspace dependency of this package would have no output to resolve on a fresh clone.
Each package below takes this package as a dev dependency and lets the build bundle one
subpath, which keeps the build engine off its runtime graph.
The [re-export guide](../../docs/contributing/reexport.md) states the rule:

1. [`@vinocss/devtools-package`](../devtools-package/README.md) ships `./package`.
2. [`@vinocss/devtools-workspace`](../devtools-workspace/README.md) ships `./workspace`.
3. [`@vinocss/utils-log`](../utils-log/README.md) ships `./log`.
4. [`@vinocss/utils-terminal`](../utils-terminal/README.md) ships `./terminal`.

This package keeps the build engine and the `vinocss-build` command.
The logger colors its own output through `./terminal`,
so the color source sits here too and a first build never waits on a workspace output.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/devtools-build`.
2. Add a `build:self` script that builds the package with the tool of your choice,
   and point `build` at `vinocss-build` when you want the builtin rolldown build.
3. Pass `--lib`, `--bin`, or `--out` to change the defaults.
4. Run `pnpm build` from the package, or let the workspace recursive build call it.

The workspace build runs each package `build:self` script by default,
so the script may call the builtin builder or another tool such as `vite build` or `rslib build`.
The `-s, --script` option names another script to run, and the `build` script is the fallback
when `build:self` is absent.

```json
{
  "scripts": {
    "build": "vinocss-build --lib theme",
    "build:self": "vinocss-build --self --lib theme"
  }
}
```

The package also exports `build`, so a script can call the same logic directly,
which is how this package builds itself before the `vinocss-build` command exists.
