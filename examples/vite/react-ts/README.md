# @vinocss/example-vite-react-ts

A typed React app that styles itself with VinoCSS.
It runs on Vite 8, enables the React compiler, and mounts into `document.body`.

## Run

1. `pnpm dev` starts the dev server.
2. `pnpm preview` serves a build once the example has a `build` script.
3. `pnpm typecheck` checks the app without emitting.

VinoCSS is not compiled yet, so a `var$`, `class$`, or `style$` call throws
until the compiler lands.
