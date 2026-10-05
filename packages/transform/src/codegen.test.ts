import { describe, expect, it } from "vitest"
import { applyEdits, mintVar, outermost, varTreeToJs } from "@/codegen"
import type { VarTree } from "@/value"

describe("mintVar", () => {
  it("mints the same name for the same leaf", () => {
    expect(mintVar("a.ts", 0, ["ink"])).toBe(mintVar("a.ts", 0, ["ink"]))
  })

  it("mints a distinct name per call position and leaf path", () => {
    const names = [
      mintVar("a.ts", 0, ["ink"]),
      mintVar("a.ts", 0, ["surface"]),
      mintVar("a.ts", 10, ["ink"]),
    ]
    expect(new Set(names).size).toBe(3)
  })
})

describe("varTreeToJs", () => {
  it("writes a nested tree, quoting a key that is not an identifier", () => {
    const tree: VarTree = {
      props: new Map([
        ["ink", { leaf: "--ink" }],
        ["brand color", { leaf: "--brand-color" }],
      ]),
    }
    expect(varTreeToJs(tree)).toBe('{ink:"--ink","brand color":"--brand-color"}')
  })

  it("writes a bare leaf as its string", () => {
    expect(varTreeToJs({ leaf: "--ink" })).toBe('"--ink"')
  })
})

describe("outermost", () => {
  it("drops an edit nested inside another", () => {
    const outer = { start: 0, end: 10, text: "a" }
    const edits = [outer, { start: 2, end: 5, text: "b" }]
    expect(outermost(edits)).toEqual([outer])
  })

  it("keeps edits that do not overlap", () => {
    const edits = [
      { start: 0, end: 4, text: "a" },
      { start: 6, end: 9, text: "b" },
    ]
    expect(outermost(edits)).toEqual(edits)
  })
})

describe("applyEdits", () => {
  it("applies edits from the end, so an earlier offset still holds", () => {
    const edits = [
      { start: 0, end: 3, text: "1" },
      { start: 8, end: 13, text: "3" },
    ]
    expect(applyEdits("one two three", edits)).toBe("1 two 3")
  })
})
