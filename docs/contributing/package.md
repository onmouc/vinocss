# Package

How to add or change a child package under `packages/`.
Read when creating a package or changing its build.

## Layout

1. The root is `vinocss-workspace`, private, and holds only shared tooling.
2. Each package lives at `packages/<name>` and starts at version `0.0.0`.
3. Its `package.json` sets the package name and `"type": "module"`.
4. `src/index.ts` is the entry and the package's public surface.
5. `README.md` opens with a short intro in the style of the root.

## Dependencies

Depend on a sibling child package with the `workspace:*` range.
pnpm rewrites that range to a real version when it publishes the package,
so the workspace range stays a local convenience and never reaches the registry.
Share an external version across packages with the workspace catalogs,
and reference it as `catalog:dep` for a dependency or `catalog:dev` for a dev dependency.

## Build

1. `@vinocss/devtools-build` drives the build, so a package runs `vinocss-build`.
2. It builds `src/index.ts` as a library entry and `src/main.ts` as a binary entry.
3. A missing entry is skipped, so a package ships only the entries it has.
4. Add `--lib` or `--bin` with a comma list to name extra entries.
5. Libraries emit esm, cjs, and bundled declarations; binaries emit esm only.
6. Every output is minified, carries a source map, and lands in `out`.
7. Point the package `exports` and `bin` at the `out` files.

## Tsconfig

1. `tsconfig.json` is a solution file with `files: []` and references.
2. `tsconfig.app.json` covers `src` and holds the `@/*` path alias.
3. `tsconfig.node.json` covers config files, when a package still keeps them.
4. The build reads `tsconfig.app.json` and reuses the alias, so no alias plugin is needed.
5. Send `tsBuildInfoFile` into `node_modules/.tmp`, since `tsc -b` writes build info.
6. Extend `@vinocss/devtools-tsconfig` for the shared compiler options.

The devtools packages under `packages-devtools/` hold that shared tooling:
[tsconfig](../../packages-devtools/tsconfig/README.md) for the shared compiler options,
and [build](../../packages-devtools/build/README.md) for the build command.

## Scripts

1. Add `build` and `typecheck` scripts that call the root tooling.
2. `build` runs `vinocss-build`, which `@vinocss/devtools-build` provides.
3. Typecheck runs `tsc -b`, so the solution tsconfig covers both projects.
4. Run `pnpm review` from the root; it covers every package.

The root keeps the tooling that builds the workspace itself,
and the workspace leaves node and pnpm versions to the environment,
so package files carry no version pins.
