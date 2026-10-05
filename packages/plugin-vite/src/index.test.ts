import { describe, expect, it } from "vitest"
import { lines } from "@vinocss/utils-lines"
import { vinocss } from "@/index"

type Transform = (code: string, id: string) => { code: string } | null
type ResolveId = (id: string) => string | null
type Load = (id: string) => string | null

describe("vinocss plugin", () => {
  it("names the plugin after the package", () => {
    expect(vinocss().name).toBe("@vinocss/plugin-vite")
  })

  it("leaves a module without a rune unchanged", () => {
    const transform = vinocss().transform as unknown as Transform
    expect(transform("const x = 1\n", "src/a.ts")).toBeNull()
  })

  it("ignores a framework file", () => {
    const transform = vinocss().transform as unknown as Transform
    expect(transform("<template />", "src/App.vue")).toBeNull()
  })
})

describe("virtual css module", () => {
  it("resolves and loads the generated css", () => {
    const plugin = vinocss()
    const transform = plugin.transform as unknown as Transform
    const source = lines(
      'import { class$ } from "vinocss"',
      'export const card = class$({ color: "red" })',
    )
    const result = transform(source, "src/a.ts")
    const pattern = /"([^"]*virtual:vinocss\/[0-9a-z]+\.css)"/u
    const virtual = pattern.exec(result?.code ?? "")?.[1] ?? ""
    expect(virtual).toContain("virtual:vinocss/")
    const resolveId = plugin.resolveId as unknown as ResolveId
    const resolved = resolveId(virtual) ?? ""
    expect(resolved).toBe(`\0${virtual}`)
    const load = plugin.load as unknown as Load
    expect(load(resolved)).toMatch(/^\.v[0-9a-z]+\{color:red\}$/u)
  })
})
