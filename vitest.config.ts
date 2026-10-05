import { workspaceGlobs } from "@vinocss/devtools-build/workspace"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      ...workspaceGlobs(), //
      "!packages/plugin-rsbuild",
      "!examples/rsbuild/react-commonjs",
    ],
  },
})
