# Example

How to add or change an example app under `packages/example-xxx`.
Read when creating an example, or editing an existing one.

## Layout

1. An example lives at `packages/example-<name>`, one folder per framework and language.
2. Its `package.json` sets the name `@vinocss/example-<name>` and `"private": true`.
3. It starts at version `0.0.0` and sets `"type": "module"`, like a child package.
4. The name uses dashes, such as `react-ts` or `svelte-js`.
5. `README.md` opens with a short intro in the style of the root.
6. `root` ends at the repository root, and the app itself lives in `src/`.

An example is a real app rather than a library, so it does not follow the
build and tsconfig rules for a library package.
It still follows the code, markdown, and TypeScript guides.

## Dependencies

1. Depend on `vinocss` with the `workspace:*` range.
2. Take every external version from a workspace catalog,
   as `catalog:example` or `catalog:example-dev`.
3. Keep a runtime framework in the catalog `example` group, such as `react` or `solid-js`.
4. Keep a build plugin, a type package, and a checker in the catalog `example-dev` group.
5. Use the latest release that stays compatible with Vite 8 and the other examples.
6. Add a new external version to the catalog first, then reference it from the example.

The workspace glob in `pnpm-workspace.yaml` already covers `packages/*`,
so a new folder joins the workspace as soon as it holds a `package.json`.
The `example` and `example-dev` groups hold a version only an example needs,
so a version a library or a devtool also uses stays in `dep` or `dev`.

## Scripts

1. `dev` runs `vite` in a module example, and `rsbuild dev` in a CommonJS one.
2. `preview` runs the matching preview command, `vite preview` or `rsbuild preview`.
3. Do not add a `build` script yet; the compiler it needs does not exist.
4. Add a `typecheck` script only to a typed app.
5. Use `tsc -b` for a plain TypeScript app.
6. Use `vue-tsc -b` for a Vue app, and `svelte-check` on the app config for a Svelte app.
7. Do not add a test script; an example shows an api, it does not test one.

A `build` script returns once the compiler lands.
Until then it would run the placeholder api, which throws by design.

## Tsconfig

1. A typed example follows the child package tsconfig layout.
2. `tsconfig.json` is a solution file with `files: []` and references.
3. `tsconfig.app.json` covers `src`, and holds the `@/*` path alias.
4. `tsconfig.node.json` covers `vite.config`, and takes the node types.
5. Extend `@vinocss/devtools-tsconfig` for the shared compiler options.
6. Send `tsBuildInfoFile` into `node_modules/.tmp`, since `tsc -b` writes build info.
7. A JavaScript example keeps one `jsconfig.json` for the alias,
   since it has no TypeScript project.

A Svelte app extends `@tsconfig/svelte` next to the shared config,
and it points `svelte-check` at `tsconfig.app.json`.

## Vite

1. Every module example uses Vite 8 for dev and preview.
2. Keep one `vite.config` with the plugin the framework needs.
3. Use `@vitejs/plugin-react` for React, and enable the React compiler.
4. Use `@vitejs/plugin-vue` for Vue, and keep the app in single-file components.
5. Use `@sveltejs/vite-plugin-svelte` for Svelte.
6. Use `vite-plugin-solid` for Solid.
7. Set `resolve.tsconfigPaths`, so Vite reads the `@/*` alias from the tsconfig.
8. Point `tsconfig` at `jsconfig.json` in a JavaScript example,
   since Vite finds the paths config by name.
9. Set `build.outDir` to `out`, so an example writes where a child package does.

React enables the compiler through the Babel preset,
so a React example also installs `@rolldown/plugin-babel`,
`babel-plugin-react-compiler`, and `@babel/core`.

## CommonJS

A `*-commonjs` example targets a legacy app, so it pins an older framework,
such as React 16, and swaps Vite for Rsbuild.

1. Omit `"type": "module"`, so `.js` and `.jsx` files stay CommonJS.
2. Use `require` and `module.exports` instead of `import` and `export`.
3. Take the framework from a catalog group of its own, such as `example-react16`.
4. Add `@rsbuild/core` from `example-dev`, and keep no Vite dependency.
5. Set `source.entry` to `./src/main.jsx` and `source.tsconfigPath` to `jsconfig.json`.
6. Set `html.template` to `./index.html`, so Rsbuild injects the entry it bundles.
7. Write the build to `out` with `output.distPath.root`.
8. Keep the VinoCSS plugin off, like every example for now.

## Entry

1. Every example mounts its root into `document.body`.
2. Let the framework mount call take `document.body` as its target.
3. Keep the entry thin; let the app component carry the styles.
4. Include an `index.html` for the entry, as a module under Vite or a template under Rsbuild.

## Styles

1. Put the VinoCSS calls in the app component file.
2. Declare the theme with `var$`, and build a class name with `class$`.
3. Use one `class$` inline in a `class` or `className` expression.
4. Bind one `class$` to a `const`, and read that name in the markup.
5. Register the page rules with `style$`.
6. Keep the sample small; one card and one button show every call.

The styles throw until the compiler lands, so an example is read for its shape
rather than run for its output; the code still has to format, lint, and type-check.

## Gate

1. Run `pnpm fmt` and `pnpm lint` after a change.
2. Run `pnpm -r typecheck` when the example is typed.
3. Keep every line within the workspace width, as `pnpm max-len` checks.
4. Run `pnpm review` from the root before the change is described.
