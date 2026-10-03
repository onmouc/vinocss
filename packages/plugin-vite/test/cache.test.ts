import { describe, expect, it } from "vitest"
import { Compiler } from "@/compiler"
import { fixture, memoryHost } from "./helpers"

describe("compiler cache", () => {
  it("recompiles a changed class with a fresh rule", () => {
    const compiler = new Compiler(memoryHost({ "a.ts": "" }))
    const first = compiler.compile(
      'import { class$ } from "vinocss"\nexport const c = class$({ color: "red" })',
      "a.ts",
    )
    const second = compiler.compile(
      'import { class$ } from "vinocss"\nexport const c = class$({ color: "blue" })',
      "a.ts",
    )
    expect(first.css).toContain("color:red")
    expect(second.css).toContain("color:blue")
    expect(second.css).not.toContain("color:red")
    expect(second.code).not.toBe(first.code)
  })

  it("re-reads a changed imported const", () => {
    const files: Record<string, string> = {
      "src/theme.ts": 'import { var$ } from "vinocss"\nexport const ink = var$("one")\n',
      "src/app.ts": fixture(
        'import { class$ } from "vinocss"',
        'import { ink } from "./theme"',
        "export const c = class$({ color: ink })",
      ),
    }
    const compiler = new Compiler(memoryHost(files))
    expect(compiler.compile(files["src/app.ts"], "src/app.ts").css).toContain("color:--one")
    files["src/theme.ts"] = 'import { var$ } from "vinocss"\nexport const ink = var$("two")\n'
    expect(compiler.compile(files["src/app.ts"], "src/app.ts").css).toContain("color:--two")
  })
})
