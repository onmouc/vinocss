# @vinocss/devtools-tsconfig

This package keeps shared TypeScript settings in one place.
It is published for anyone to use, so any project can follow the same recipe.

When a package extends a config from here, it inherits the compiler options we all agree on.
It then writes down only the few details that are specific to that package.

## Variants

1. `@vinocss/devtools-tsconfig/base` is the plain recipe: the options every project shares.
2. `@vinocss/devtools-tsconfig/app` extends `base` with declaration output for shipped source.
3. `@vinocss/devtools-tsconfig/node` extends `base` for config files that run in node.

You choose a variant by naming it in `extends`.
The names map to the files under `src/`, such as `src/tsconfig.app.json`.
There is no build step here, because TypeScript reads these files exactly as they are.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/devtools-tsconfig`.
2. Point `extends` at the variant that matches the project you are configuring.
3. Use `app` for your source, and `node` for files such as `rolldown.config.ts`.
4. Keep `include`, `paths`, and `tsBuildInfoFile` inside your own package.
5. Leave the solution `tsconfig.json` local; it only lists the project references.

`extends` simply means "start from this file, then apply my changes".
Anything you write in your own file wins over the shared default,
so you are always free to override what the shared config sets.

You may wonder why those three options stay local.
The shared files avoid every path that points into a package,
because TypeScript resolves a relative path against the file that declares it.
A shared `include` or `paths` would therefore point at the wrong folder,
and only your package knows where its own files live.

## Example

Here is a package that ships source and also has a build config.
Each file extends a variant, then adds only the details that belong to the package.

`tsconfig.app.json`:

```json
{
  "extends": "@vinocss/devtools-tsconfig/app",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:

```json
{
  "extends": "@vinocss/devtools-tsconfig/node",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo"
  },
  "include": ["rolldown.config.ts"]
}
```
