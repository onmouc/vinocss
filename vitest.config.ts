import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      "packages/*", //
      "!packages/plugin-rsbuild",
      "!packages/example-react-commonjs",
    ],
  },
})
