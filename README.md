# VinoCSS

The readme of the whole workspace, and the entry point to the packages under `packages/`.
VinoCSS is a variable integrated nano CSS framework,
and the framework package itself is [`vinocss`](./packages/vinocss/README.md).

## Status

1. This project is a WIP (work in progress) at an early stage.
2. The API is not stable, and it may change without notice.
3. The compiler is not implemented, so every runtime call throws.
4. It is not prepared for community contributions yet.

Until the compiler lands, treat the code as a design sketch,
and read a package readme for the contract it plans to honor.

## Packages

1. Read the [workspace intro](./docs/workspace.md) for every package and what it holds.
2. Start with [`vinocss`](./packages/vinocss/README.md) for the api an app imports.
3. Reach for a `@vinocss/devtools-*` package for the shared workspace tooling.

## Utils

The workspace ships small shared helpers as `@vinocss/utils-*` packages,
so a caller reaches one rule instead of writing its own.

1. [`@vinocss/utils-case`](./packages/utils-case/README.md) splits a name into words
   and rebuilds it as camel, kebab, pascal, snake, or another common case.
2. [`@vinocss/utils-terminal`](./packages/utils-terminal/README.md) wraps a text in
   ansi escape sequences for a terminal style, color, or both.
3. [`@vinocss/utils-lines`](./packages/utils-lines/README.md) joins source parts into
   one string, one part per line, so a multi-line snippet keeps its shape.
4. [`@vinocss/utils-log`](./packages/utils-log/README.md) formats a console line with
   a level, a time, and the cost since the previous line.

## Devtools

Next to the framework, the workspace ships a family of `@vinocss/devtools-*` packages.
They are published for anyone to use, so another project can adopt the same build,
config, and check recipe instead of writing its own.

1. [`@vinocss/devtools-build`](./packages/devtools-build/README.md) wraps the rolldown
   build behind one `vinocss-build` command, and backs the shared reads.
2. [`@vinocss/devtools-tsconfig`](./packages/devtools-tsconfig/README.md) holds the shared
   TypeScript config variants a source or a node config can extend.
3. [`@vinocss/devtools-max-len`](./packages/devtools-max-len/README.md) reports any tracked
   line over the width limit, as the `vinocss-max-len` command.
4. [`@vinocss/devtools-license`](./packages/devtools-license/README.md) syncs the root
   `LICENSE` into every published child package, as the `vinocss-license` command.
5. [`@vinocss/devtools-package`](./packages/devtools-package/README.md) reads a node package
   and its manifest, so a tool reaches one package read.
6. [`@vinocss/devtools-workspace`](./packages/devtools-workspace/README.md) reads a pnpm
   workspace and orders its packages for a build.

Each package readme states its surface and how to install it.
Reaching for a tool is welcome, and a project may adopt a single one on its own.
