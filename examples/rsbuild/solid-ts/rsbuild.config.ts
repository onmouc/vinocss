import { defineConfig } from "@rsbuild/core"
import { pluginSolid } from "@rsbuild/plugin-solid"

export default defineConfig({
  plugins: [pluginSolid()],
  source: {
    entry: { index: "./src/main.tsx" },
    tsconfigPath: "./tsconfig.app.json",
  },
  html: {
    template: "./index.html",
  },
  output: {
    distPath: { root: "out" },
  },
})
