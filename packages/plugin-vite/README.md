# @vinocss/plugin-vite

The Vite plugin that will compile VinoCSS source.

Today it is a placeholder: it transforms a source file to itself,
so an app can wire it into a Vite config before the compiler lands.
The transform changes no code, so the build output stays the same.

## Usage

1. Install it as a dev dependency, for example `pnpm add -D @vinocss/plugin-vite`.
2. Add `vinocss()` to the `plugins` array of the Vite config.
3. Keep `vinocss` imported from the package root.

```ts
import { defineConfig } from "vite"
import { vinocss } from "@vinocss/plugin-vite"

export default defineConfig({
  plugins: [vinocss()],
})
```

## Status

1. The plugin claims the transform of every module and returns the source unchanged.
2. No css is emitted yet, since the compiler is not implemented.
3. The compiler will replace the transform in a later change without moving the plugin entry.
