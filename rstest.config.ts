import { defineConfig } from "@rstest/core"

export default defineConfig({
  projects: [
    "packages/plugin-rsbuild", //
    "packages/example-react-commonjs",
  ],
})
