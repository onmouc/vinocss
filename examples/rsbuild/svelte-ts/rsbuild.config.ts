import { defineConfig } from "@rsbuild/core"
import { pluginSvelte } from "@rsbuild/plugin-svelte"

export default defineConfig({
  plugins: [pluginSvelte()],
  source: {
    entry: { index: "./src/main.ts" },
    tsconfigPath: "./tsconfig.app.json",
  },
  html: {
    template: "./index.html",
  },
  output: {
    distPath: { root: "out" },
  },
})
