# Re-export

How a child package ships a read from `@vinocss/devtools-build` without depending on it.
Read when adding or changing a package such as `utils-log`, `utils-terminal`,
`devtools-package`, or `devtools-workspace`.

## Reason

The build tool bootstraps from its own source before any workspace package has built output,
so a workspace dependency of the build tool would have no output on a fresh clone,
and the first build would loop. The source of every shared read therefore lives in
`@vinocss/devtools-build`, and a small package ships it under a short name.

## Rule

1. Declare `@vinocss/devtools-build` as a dev dependency, never a runtime one.
2. Point `src/index.ts` at one subpath, such as `export * from "@vinocss/devtools-build/log"`.
3. Let the build bundle the subpath, since a dev dependency stays out of the external list.
4. Keep the package readme short, and link to the build readme for the read's surface.

The dev dependency is the point: the build package carries `rolldown`,
`rolldown-plugin-dts`, `typescript`, and `commander`,
and a consumer that only wants a logger or a decorator should not install them.

The rest of the package rules still apply, so follow [package](./package.md)
and the [index](./index.md) for the shared layout, scripts, and tsconfig.
