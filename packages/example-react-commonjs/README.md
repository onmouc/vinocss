# @vinocss/example-react-commonjs

A React 16 app written in CommonJS and styled with VinoCSS.
It runs on Rsbuild, which bundles CommonJS and classic JSX, and mounts into `document.body`.

## Run

1. `pnpm dev` starts the dev server.
2. `pnpm preview` serves a build once the example has a `build` script.

VinoCSS is not compiled yet, so a `var$`, `class$`, or `style$` call throws
until the compiler lands.
