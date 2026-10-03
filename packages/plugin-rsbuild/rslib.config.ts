import { defineConfig } from "@rslib/core"

export default defineConfig({
  lib: [{ format: "esm", dts: true }, { format: "cjs" }],
  source: { tsconfigPath: "./tsconfig.build.json" },
  output: { distPath: { root: "out" }, sourceMap: true },
})
