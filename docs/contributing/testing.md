# Testing

How to add and run tests in the workspace.
Read when adding, changing, or running tests.

## Layout

1. The root `vitest.config.ts` lists the package roots as projects: `packages/*` and `packages-devtools/*`.
2. Vitest treats each matched folder as a project, and reads its `vitest.config.ts` when one exists.
3. Give a package a `vitest.config.ts` only when it has tests.
4. Put a test beside its source, in `src/`, named `<source>.test.ts`.
5. Put a test that spans more than one source file in the package `test/` folder.
6. Include `test` in `tsconfig.app.json`, so typecheck covers both folders.

## Config

1. Set `resolve.tsconfigPaths: true` to reuse the `@/*` alias from the tsconfig.
2. Do not repeat the alias in the vitest config; the tsconfig stays the one source.
3. Keep the config small; the defaults already cover a node environment.
4. Install `vitest` and `vite` in every package that has tests.
5. Run `pnpm test` from the root; it runs every project.

A package adds vitest only once it has tests, so a package without tests stays lean,
and the root project glob picks up the package as soon as its config appears.

## Choice

1. Test a piece only when its logic is hard to follow from the source.
2. Leave a simple function to the reader; a getter, a one-line branch, or a plain read needs no test.
3. Reach for a test at a real edge or failure, such as a cycle, a wildcard glob, or a stale cache.
4. Prefer a few tests that pin a rule over many that restate the code.
5. Drop a test that only repeats what the source already states.

## Rules

1. Import the helpers from `vitest`; do not rely on globals.
2. Build a fixture in a temp directory, and remove it after the test.
3. Prefer a behavior test over a test bound to the current implementation.
4. Cover the edge cases next to the happy path.
5. Pass a test double for a reporter and assert its calls, per [log](./log.md).
6. Keep the suite fast; a slow test tends to stop being run.
