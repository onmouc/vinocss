import { describe, expect, it } from "vitest"
import { globToRegExp } from "@/workspace/glob"

describe("globToRegExp", () => {
  it("matches one segment with a star", () => {
    expect(globToRegExp("packages/*").test("packages/a")).toBe(true)
    expect(globToRegExp("packages/*").test("packages/a/b")).toBe(false)
  })

  it("matches across segments with a double star", () => {
    expect(globToRegExp("packages/**").test("packages/a/b")).toBe(true)
    expect(globToRegExp("**/test").test("a/b/test")).toBe(true)
    expect(globToRegExp("**/test").test("test")).toBe(true)
  })

  it("matches a single character with a question mark", () => {
    expect(globToRegExp("pkg?").test("pkg1")).toBe(true)
    expect(globToRegExp("pkg?").test("pkg12")).toBe(false)
  })

  it("rejects a glob that could backtrack badly", () => {
    expect(() => globToRegExp("*a*a*a*a*a*a*a*a*")).toThrow(/too many wildcards/u)
  })
})
