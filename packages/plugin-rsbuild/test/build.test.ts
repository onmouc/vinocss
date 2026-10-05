import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createRsbuild } from "@rsbuild/core"
import { afterEach, describe, expect, it } from "@rstest/core"
import { lines } from "@vinocss/utils-lines"
import { vinocss } from "@/index"

const dirs: string[] = []

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "vinocss-rsbuild-"))
  dirs.push(dir)
  for (const [name, content] of Object.entries(files)) {
    const file = join(dir, name)
    mkdirSync(join(file, ".."), { recursive: true })
    writeFileSync(file, content)
  }
  return dir
}

function read(root: string, extension: string): string {
  const files = readdirSync(root, { recursive: true, encoding: "utf8" })
  const match = files.filter((file) => file.endsWith(extension))
  return match.map((file) => readFileSync(join(root, file), "utf8")).join("\n")
}

describe("rsbuild build", () => {
  it("compiles the runes and extracts the css", async () => {
    const dir = fixture({
      "index.html": '<div id="root"></div>',
      "src/theme.ts": 'export const color = "red"\n',
      "src/app.ts": lines(
        'import { color } from "./theme"',
        'export const card = class$({ color, "&:hover": { color: "blue" } })',
        'style$({ body: { margin: "0" } })',
      ),
    })

    const rsbuild = await createRsbuild({
      cwd: dir,
      rsbuildConfig: {
        plugins: [vinocss()],
        source: { entry: { index: "./src/app.ts" } },
        html: { template: "./index.html" },
        logLevel: "error",
      },
    })
    await rsbuild.build()

    const dist = join(dir, "dist")
    const css = read(dist, ".css")
    const js = read(dist, ".js")
    expect(css).toContain("color:red")
    expect(css).toContain(":hover")
    expect(css).toContain("body{margin:0}")
    expect(js).not.toContain("class$")
    expect(js).not.toContain("style$")
    expect(js).not.toContain("virtual:vinocss")
  })
})
