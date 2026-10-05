import { describe, expect, it } from "vitest"
import { lines } from "@vinocss/utils-lines"
import { compile } from "./helpers"

describe("style$ emission", () => {
  it("emits global rules and removes the call", () => {
    const source = lines(
      'import { style$ } from "vinocss"',
      "style$({",
      '  body: { margin: "0", fontFamily: "system-ui, sans-serif" },',
      "})",
    )
    const result = compile({ "a.ts": source }, "a.ts")
    expect(result.code).not.toContain("style$(")
    expect(result.code.startsWith('import "virtual:vinocss/')).toBe(true)
    expect(result.css).toBe("body{margin:0;font-family:system-ui, sans-serif}")
  })

  it("shares the virtual css with a class$ rule", () => {
    const source = lines(
      'import { class$, style$, var$ } from "vinocss"',
      "const theme = var$({ surface: null, ink: null })",
      "export const card = class$({ color: theme.ink })",
      "style$({",
      '  ":root": { [theme.surface]: "#ffffff" },',
      '  body: { ":hover": { color: "red" } },',
      "})",
    )
    const result = compile({ "a.ts": source }, "a.ts")
    expect(result.css).toMatch(/^\.v[0-9a-z]+\{color:--[0-9a-z]+\}/u)
    expect(result.css).toContain(":root{--")
    expect(result.css).toContain(":#ffffff}body:hover{color:red}")
    expect(result.virtualId).not.toBeNull()
  })

  it("rejects a computed selector", () => {
    const source = lines(
      'import { style$ } from "vinocss"',
      'const name = "body"',
      'style$({ [name]: { margin: "0" } })',
    )
    expect(() => compile({ "a.ts": source }, "a.ts")).toThrow(/literal selector/u)
  })

  it("rejects a non-object value", () => {
    const source = lines('import { style$ } from "vinocss"', 'style$({ body: "red" })')
    expect(() => compile({ "a.ts": source }, "a.ts")).toThrow(/style object/u)
  })
})
