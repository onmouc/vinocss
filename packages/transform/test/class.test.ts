import { describe, expect, it } from "vitest"
import { lines } from "@vinocss/utils-lines"
import { compile } from "./helpers"

describe("class$ emission", () => {
  it("emits a rule and a hashed name", () => {
    const source = lines(
      'import { class$ } from "vinocss"',
      "export const card = class$({",
      '  padding: "1.5rem",',
      '  borderRadius: "0.75rem",',
      "})",
    )
    const result = compile({ "a.ts": source }, "a.ts")
    expect(result.code).toContain('const card = "v')
    expect(result.code.startsWith('import "virtual:vinocss/')).toBe(true)
    expect(result.css).toMatch(/^\.v[0-9a-z]+\{padding:1\.5rem;border-radius:0\.75rem\}$/u)
  })

  it("keeps a fallback list, a nested selector, and an at-rule", () => {
    const source = lines(
      'import { class$ } from "vinocss"',
      "export const card = class$({",
      '  background: ["#fff", "oklch(0.6 0.2 264)"],',
      '  ":hover": { color: "red" },',
      '  "@media (min-width: 40rem)": { padding: "1rem" },',
      "})",
    )
    const expected = [
      String.raw`^\.v[0-9a-z]+\{background:#fff;background:oklch\(0\.6 0\.2 264\)\}`,
      String.raw`\.v[0-9a-z]+:hover\{color:red\}`,
      String.raw`@media \(min-width: 40rem\)\{\.v[0-9a-z]+\{padding:1rem\}\}$`,
    ].join("")
    expect(compile({ "a.ts": source }, "a.ts").css).toMatch(new RegExp(expected, "u"))
  })

  it("rejects a dynamic value", () => {
    const source = lines(
      'import { class$ } from "vinocss"',
      "let dynamic = 1",
      "export const card = class$({ color: dynamic })",
    )
    expect(() => compile({ "a.ts": source }, "a.ts")).toThrow(/dynamic/u)
  })
})

describe("class$ references", () => {
  it("substitutes a bare var$ name and leaves the wrap to the author", () => {
    const source = lines(
      'import { class$, var$ } from "vinocss"',
      "const theme = var$({ ink: null })",
      "export const card = class$({ color: theme.ink })",
    )
    const css = compile({ "a.ts": source }, "a.ts").css
    expect(css).toMatch(/^\.v[0-9a-z]+\{color:--[0-9a-z]+\}$/u)
  })

  it("follows a nested member chain", () => {
    const source = lines(
      'import { class$, var$ } from "vinocss"',
      "export const theme = var$({ group: { ink: null } })",
      "export const card = class$({ color: theme.group.ink })",
    )
    expect(compile({ "a.ts": source }, "a.ts").css).toMatch(/color:--[0-9a-z]+/u)
  })

  it("wraps a var$ name with the v() helper", () => {
    const source = lines(
      'import { class$, var$ } from "vinocss"',
      'import { v } from "vinocss/utils"',
      "const theme = var$({ ink: null })",
      "export const card = class$({ color: v(theme.ink) })",
    )
    const css = compile({ "a.ts": source }, "a.ts").css
    expect(css).toMatch(/^\.v[0-9a-z]+\{color:var\(--[0-9a-z]+\)\}$/u)
  })

  it("applies the utils helpers", () => {
    const source = lines(
      'import { class$ } from "vinocss"',
      'import { px, rem, v } from "vinocss/utils"',
      'const ink = v("--brand")',
      "export const card = class$({ padding: px(4), margin: rem(1.5), color: ink })",
    )
    const css = compile({ "a.ts": source }, "a.ts").css
    expect(css).toMatch(/padding:4px;margin:1\.5rem;color:var\(--brand\)/u)
  })
})
