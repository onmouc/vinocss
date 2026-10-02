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
