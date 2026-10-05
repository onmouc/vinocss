import { defineConfig } from "@rsbuild/core"
import { pluginVue } from "@rsbuild/plugin-vue"

export default defineConfig({
  plugins: [pluginVue()],
  source: {
    entry: { index: "./src/main.js" },
    tsconfigPath: "./jsconfig.json",
  },
  html: {
    template: "./index.html",
  },
  output: {
    distPath: { root: "out" },
  },
})
