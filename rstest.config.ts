import { existsSync } from "node:fs"
import { join, relative } from "node:path"
import { detectWorkspace, toPosix } from "@vinocss/devtools-workspace"
import { defineConfig } from "@rstest/core"

export default defineConfig({
  projects: (() => {
    const workspace = detectWorkspace()
    if (!workspace) return []
    return workspace.packages
      .filter((pkg) => existsSync(join(pkg.dir, "rstest.config.ts")))
      .map((pkg) => toPosix(relative(workspace.root, pkg.dir)))
      .toSorted()
  })(),
})
