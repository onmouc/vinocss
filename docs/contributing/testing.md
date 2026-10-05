# Testing

How to add and run tests in the workspace.
Read when adding, changing, or running tests.

## Layout

1. The root `vitest.config.ts` asks the workspace for its child packages,
   and lists every package that holds a `vitest.config.ts` as a project.
2. Adding the config is the only step; the root list picks the package up on its own.
3. Give a package a `vitest.config.ts` only when it has tests.
4. Put a unit test beside its source, in `src/`, named `<source>.test.ts`.
   It covers one function or one source file, even when it builds a fixture on disk.
5. Put a behavior test in `test/` when it must cover more than one source file,
   or a whole tool at once, such as a bundler build or a git run.
6. A behavior test usually holds several scenarios,
   so the folder may keep more than one file, each for one concern.
7. Include `test` in `tsconfig.app.json` only when the package has a `test` folder.
8. When a build emits a declaration per source file, exclude `src/**/*.test.ts` in its
   build tsconfig, so a unit test never reaches the published `out`.

## Config

1. Set `resolve.tsconfigPaths: true` to reuse the `@/*` alias from the tsconfig.
2. Do not repeat the alias in the vitest config; the tsconfig stays the one source.
3. Keep the config small; the defaults already cover a node environment.
4. The default include already finds a `*.test.ts` file under the package, so leave it out.
5. Install the runner and its build tool in every test package: `vitest` and `vite`, or `rstest`.
6. Run `pnpm test` from the root; it runs every project.

A package adds vitest only once it has tests, so a package without tests stays lean,
and the root project list picks the package up as soon as its config appears.

## Rstest

1. An Rsbuild-based package tests with Rstest instead of Vitest.
2. Add `rstest.config.ts` and set `source.tsconfigPath` to the app tsconfig.
3. The root `rstest.config.ts` finds the package from its config,
   and Vitest skips it while it has no `vitest.config.ts`.
4. Run `rstest run` from the package; the root `rstest run` covers it too.

## Choice

1. Test a piece only when its logic is hard to follow from the source.
2. Leave a simple function to the reader;
   a getter, a one-line branch, or a plain read needs no test.
3. Reach for a test at a real edge or failure, such as a cycle, a wildcard glob, or a stale cache.
4. Prefer a few tests that pin a rule over many that restate the code.
5. Drop a test that only repeats what the source already states.

## Rules

1. Import the helpers from the runner; do not rely on globals.
   A Vitest package reads `vitest`, and an Rstest one reads `@rstest/core`.
2. Build a fixture in a temp directory, and remove it after the test.
3. Prefer a behavior test over a test bound to the current implementation.
4. Cover the edge cases next to the happy path.
5. Pass a test double for a reporter and assert its calls, per [log](./log.md).
6. Keep the suite fast; a slow test tends to stop being run.
7. Break a long fixture across lines, with `+` or a small joining helper,
   one source line per string line, as a reader would meet the file.
