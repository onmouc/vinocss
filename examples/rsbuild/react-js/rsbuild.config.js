import { defineConfig } from "@rsbuild/core"
import { pluginReact } from "@rsbuild/plugin-react"

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: { index: "./src/main.jsx" },
    tsconfigPath: "./jsconfig.json",
  },
  html: {
    template: "./index.html",
  },
  output: {
    distPath: { root: "out" },
  },
})
