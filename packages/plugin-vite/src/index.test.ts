import { describe, expect, it } from "vitest"
import { transform, vinocss } from "@/index"

describe("vinocss", () => {
  it("names the plugin after the package", () => {
    expect(vinocss().name).toBe("@vinocss/plugin-vite")
  })

  it("returns a source file unchanged", () => {
    const source = 'const accent = var$("brand-accent")\n'
    expect(transform(source)).toBe(source)
  })
})
