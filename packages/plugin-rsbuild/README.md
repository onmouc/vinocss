# @vinocss/plugin-rsbuild

The Rsbuild plugin that compiles VinoCSS source.

It is the Rsbuild side of [`@vinocss/transform`](../transform/README.md).
The plugin transforms each matching module with the shared compiler,
turns the css a transform freed into a data module Rsbuild reads as a stylesheet,
and leaves the rest to Rsbuild. The runtime sees no VinoCSS call,
so the bundle carries only the css it uses.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/plugin-rsbuild`.
2. Add `vinocss()` to the `plugins` array of the Rsbuild config.
3. Keep `vinocss` imported from the package root.

```ts
import { defineConfig } from "@rsbuild/core"
import { vinocss } from "@vinocss/plugin-rsbuild"

export default defineConfig({
  plugins: [vinocss()],
})
```

## Behavior

1. A matching module is a plain `.js`, `.jsx`, `.ts`, or `.tsx` file;
   a framework file such as `.vue` is skipped, since its language plugin owns it.
2. A module without a `var$`, `class$`, or `style$` call is left unchanged.
3. The generated css resolves as a data module, so a module is parsed once
   and an imported const is resolved once per build.

## Status

1. The plugin is the Rsbuild encapsulation of the shared compiler.
2. Read [transform](../transform/README.md) for the calls it compiles and the rules they emit.
