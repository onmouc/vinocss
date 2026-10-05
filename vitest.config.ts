import { existsSync } from "node:fs"
import { join, relative } from "node:path"
import { detectWorkspace, toPosix } from "@vinocss/devtools-build/workspace"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: (() => {
      const workspace = detectWorkspace()
      if (!workspace) return []
      return workspace.packages
        .filter((pkg) => existsSync(join(pkg.dir, "vitest.config.ts")))
        .map((pkg) => toPosix(relative(workspace.root, pkg.dir)))
        .toSorted()
    })(),
  },
})
