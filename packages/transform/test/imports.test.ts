import { describe, expect, it } from "vitest"
import { lines } from "@vinocss/utils-lines"
import { compile } from "./helpers"

const varImport = 'import { var$ } from "vinocss"\n'

describe("imported consts", () => {
  it("reads a const from another file", () => {
    const files = {
      "src/theme.ts": varImport + "export const theme = var$({ ink: null })\n",
      "src/app.ts": lines(
        'import { class$ } from "vinocss"',
        'import { theme } from "./theme"',
        "export const card = class$({ color: theme.ink })",
      ),
    }
    const name = /ink:"(--[0-9a-z]+)"/u.exec(compile(files, "src/theme.ts").code)?.[1]
    expect(name).toBeDefined()
    expect(compile(files, "src/app.ts").css).toContain(`color:${name}`)
  })
})

describe("re-exports", () => {
  it("follows a star export", () => {
    const files = {
      "src/theme.ts": varImport + 'export const ink = var$("ink")\n',
      "src/index.ts": 'export * from "./theme"\n',
      "src/app.ts": lines(
        'import { class$ } from "vinocss"',
        'import { ink } from "./index"',
        "export const card = class$({ color: ink })",
      ),
    }
    expect(compile(files, "src/app.ts").css).toContain("color:--ink")
  })

  it("follows a diamond star export", () => {
    const files = {
      "src/theme.ts": varImport + 'export const ink = var$("ink")\n',
      "src/a.ts": 'export * from "./theme"\n',
      "src/b.ts": 'export * from "./theme"\n',
      "src/index.ts": 'export * from "./a"\nexport * from "./b"\n',
      "src/app.ts": lines(
        'import { class$ } from "vinocss"',
        'import { ink } from "./index"',
        "export const card = class$({ color: ink })",
      ),
    }
    expect(compile(files, "src/app.ts").css).toContain("color:--ink")
  })

  it("reads a default export", () => {
    const files = {
      "src/theme.ts": varImport + "export default var$({ ink: null })\n",
      "src/app.ts": lines(
        'import { class$ } from "vinocss"',
        'import theme from "./theme"',
        "export const card = class$({ color: theme.ink })",
      ),
    }
    expect(compile(files, "src/app.ts").css).toMatch(/color:--[0-9a-z]+/u)
  })
})

describe("static failures", () => {
  it("reports a cyclic constant instead of looping", () => {
    const files = {
      "src/a.ts": lines(
        'import { var$ } from "vinocss"',
        'import { b } from "./b"',
        "export const a = var$(b)",
      ),
      "src/b.ts": lines(
        'import { var$ } from "vinocss"',
        'import { a } from "./a"',
        "export const b = var$(a)",
      ),
    }
    expect(() => compile(files, "src/a.ts")).toThrow(/cyclic/u)
  })

  it("reports an unresolvable import", () => {
    const app = lines(
      'import { class$ } from "vinocss"',
      'import { theme } from "missing"',
      "export const card = class$({ color: theme.ink })",
    )
    expect(() => compile({ "src/app.ts": app }, "src/app.ts")).toThrow(/static/u)
  })
})
