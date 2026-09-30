import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"

export default defineConfig([
  {
    input: "src/index.ts",
    plugins: [dts({ tsconfig: "./tsconfig.app.json", sourcemap: true })],
    output: {
      dir: "out",
      format: "esm",
      minify: true,
      sourcemap: true,
    },
  },
  {
    input: "src/index.ts",
    output: {
      dir: "out",
      format: "cjs",
      entryFileNames: "index.cjs",
      minify: true,
      sourcemap: true,
    },
  },
])
