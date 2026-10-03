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

## Devtools

Next to the framework, the workspace ships a family of `@vinocss/devtools-*` packages.
They are published for anyone to use, so another project can adopt the same build,
config, and check recipe instead of writing its own.

1. [`@vinocss/devtools-build`](./packages/devtools-build/README.md) wraps the rolldown
   build behind one `vinocss-build` command, and exposes the node and workspace reads.
2. [`@vinocss/devtools-tsconfig`](./packages/devtools-tsconfig/README.md) holds the shared
   TypeScript config variants a source or a node config can extend.
3. [`@vinocss/devtools-max-len`](./packages/devtools-max-len/README.md) reports any tracked
   line over the width limit, as the `vinocss-max-len` command.
4. [`@vinocss/devtools-license`](./packages/devtools-license/README.md) syncs the root
   `LICENSE` into every published child package, as the `vinocss-license` command.
5. [`@vinocss/devtools-lines`](./packages/devtools-lines/README.md) joins source parts into
   one string, one part per line, so a multi-line snippet keeps its shape.

Each package readme states its surface and how to install it.
Reaching for a tool is welcome, and a project may adopt a single one on its own.
