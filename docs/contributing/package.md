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

## Build

1. `rolldown.config.ts` drives the build and reads tsconfig on its own.
2. Emit esm, cjs, and bundled declarations, each with a source map.
3. Minify the js output, and leave declarations readable.
4. Keep the cjs pass in its own config, since declaration bundling only supports esm.
5. Write to `out`, which `.gitignore` already covers.
6. Point the package `exports` at the `out` files.

## Tsconfig

1. `tsconfig.json` is a solution file with `files: []` and references.
2. `tsconfig.app.json` covers `src` and holds the `@/*` path alias.
3. `tsconfig.node.json` covers the config files, such as `rolldown.config.ts`.
4. Rolldown follows the references and reuses the alias, so no alias plugin is needed.
5. Send `tsBuildInfoFile` into `node_modules/.tmp`, since `tsc -b` writes build info.
6. Extend `@vinocss/devtools-tsconfig` for the shared compiler options.

The devtools package at `packages-devtools/tsconfig` holds those shared configs.
Its [readme](../../packages-devtools/tsconfig/README.md) covers the variants and how to extend them.

## Scripts

1. Add `build` and `typecheck` scripts that call the root tooling.
2. Typecheck runs `tsc -b`, so the solution tsconfig covers both projects.
3. Run `pnpm review` from the root; it covers every package.

Shared tooling such as rolldown and TypeScript stays in the root `devDependencies`,
so the build config resolves it while the package declares only what it imports.
The workspace also leaves node and pnpm versions to the environment,
so package files carry no version pins.
