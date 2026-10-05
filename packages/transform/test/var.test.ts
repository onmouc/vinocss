import { describe, expect, it } from "vitest"
import { lines } from "@vinocss/utils-lines"
import { compile } from "./helpers"

const varImport = 'import { var$ } from "vinocss"\n'

describe("var$ literal names", () => {
  it("prefixes a literal name", () => {
    const source = varImport + 'const accent = var$("brand-accent")\n'
    const result = compile({ "a.ts": source }, "a.ts")
    expect(result.code).toContain('const accent = "--brand-accent"')
    expect(result.css).toBe("")
  })

  it("rejects an empty name", () => {
    const source = varImport + 'const bad = var$("")\n'
    expect(() => compile({ "a.ts": source }, "a.ts")).toThrow(/empty/u)
  })
})

describe("var$ minted names", () => {
  it("mints a stable name for each null leaf", () => {
    const source = varImport + "export const theme = var$({ surface: null, ink: null })\n"
    const first = compile({ "a.ts": source }, "a.ts")
    const second = compile({ "a.ts": source }, "a.ts")
    expect(first.code).toBe(second.code)
    expect(first.code).toMatch(/const theme = \{surface:"--[0-9a-z]+",ink:"--[0-9a-z]+"\}/u)
  })
})

describe("var$ computed names", () => {
  it("joins a template literal", () => {
    const source = lines(
      'import { var$ } from "vinocss"',
      'const brand = "brand"',
      "const accent = var$(`${brand}-accent`)",
    )
    expect(compile({ "a.ts": source }, "a.ts").code).toContain('const accent = "--brand-accent"')
  })

  it("joins a plus expression", () => {
    const source = varImport + 'const accent = var$("brand" + "-accent")\n'
    expect(compile({ "a.ts": source }, "a.ts").code).toContain('const accent = "--brand-accent"')
  })
})
