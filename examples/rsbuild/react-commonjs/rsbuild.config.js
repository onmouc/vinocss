const { defineConfig } = require("@rsbuild/core")

module.exports = defineConfig({
  source: {
    entry: {
      index: "./src/main.jsx",
    },
    tsconfigPath: "jsconfig.json",
  },
  html: {
    template: "./index.html",
  },
  output: {
    distPath: {
      root: "out",
    },
  },
})
