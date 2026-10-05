import { defineConfig } from "@rstest/core"

export default defineConfig({
  projects: [
    "packages/plugin-rsbuild", //
    "examples/rsbuild/react-commonjs",
  ],
})
